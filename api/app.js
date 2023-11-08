const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Importa el módulo CORS
const https = require('https');
const fs = require('fs'); // Módulo para trabajar con el sistema de archivos
const app = express();

const options = {
  key: fs.readFileSync('grupolimpiolux.key'),     // Reemplaza 'tu-archivo.key' con la ruta a tu archivo .key
  cert: fs.readFileSync('grupolimpiolux.crt'),   // Reemplaza 'tu-archivo.crt' con la ruta a tu archivo .crt
};

app.use(express.json({ limit: '20000000mb' }));
app.use(express.urlencoded({ limit: '2000000mb', extended: true }));


// Configura CORS
const corsOptions = {
    origin: 'https://servicios.grupolimpiolux.com.ar', // Reemplaza con el dominio de tu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Habilita las cookies y encabezados de autorización
};

app.use(cors(corsOptions));

// Conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'mysql',
  user: 'root',
  password: 'root',
  database: 'ticketreact',
});

setInterval(() => {
  db.query('SELECT 1', (err) => {
    if (err) {
      console.error('Error al hacer ping a la base de datos:', err);
    } else {
      console.log('Ping a la base de datos exitoso'); // Agrega un console.log
    }
  });
}, 60000);

db.connect(err => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});

// Ruta de registro (crear un nuevo usuario)
app.post('/api/register', async (req, res) => {
  const { nombre, email, password, cargo, casa } = req.body;

  // Encripta la contraseña antes de almacenarla en la base de datos
  const hashedPassword = await bcrypt.hash(password, 10);

  // Inserta el nuevo usuario en la base de datos
  db.query(
    'INSERT INTO users (nombre, mail, contraseña, cargo, casa) VALUES (?, ?, ?, ?, ?)',
    [nombre, email, hashedPassword, cargo, casa],
    (insertError, insertResults) => {
      if (insertError) {
        console.error('Error al insertar en la base de datos:', insertError);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else {
        res.status(201).json({ message: 'Usuario registrado con éxito' });
      }
    }
  );
});

// Ruta para cambiar la contraseña
app.put('/api/changepassword/:id', async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;

  // Verificar si la contraseña actual coincide con la almacenada en la base de datos
  db.query(
    'SELECT contraseña FROM users WHERE id = ?',
    [userId],
    async (selectError, selectResults) => {
      if (selectError) {
        console.error('Error al buscar el usuario:', selectError);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else if (selectResults.length === 0) {
        res.status(404).json({ error: 'Usuario no encontrado' });
      } else {
        const storedPassword = selectResults[0].contraseña;
        
        // Compara la contraseña actual con la almacenada en la base de datos
        const passwordMatch = await bcrypt.compare(currentPassword, storedPassword);

        if (!passwordMatch) {
          res.status(401).json({ error: 'La contraseña actual es incorrecta' });
        } else {
          // Encripta la nueva contraseña
          const hashedNewPassword = await bcrypt.hash(newPassword, 10);

          // Actualiza la contraseña en la base de datos
          db.query(
            'UPDATE users SET contraseña = ? WHERE id = ?',
            [hashedNewPassword, userId],
            (updateError, updateResults) => {
              if (updateError) {
                console.error('Error al actualizar la contraseña:', updateError);
                res.status(500).json({ error: 'Error interno del servidor' });
              } else {
                res.status(200).json({ message: 'Contraseña actualizada con éxito' });
              }
            }
          );
        }
      }
    }
  );
});



// Ruta de inicio de sesión (login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // Consulta la base de datos para obtener el usuario por email
  db.query('SELECT * FROM users WHERE mail = ?', [email], async (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      if (results.length > 0) {
        const user = results[0];

        // Compara la contraseña ingresada con la almacenada en la base de datos
        const match = await bcrypt.compare(password, user.contraseña);

        if (match) {
          // Genera un token JWT
          const token = jwt.sign({ userId: user.id }, 'tu_secreto', { expiresIn: '1h' });

          // Devuelve todos los datos del usuario junto con el token
          res.status(200).json({ token, user });
        } else {
          res.status(401).json({ error: 'Credenciales incorrectas' });
        }
      } else {
        res.status(404).json({ error: 'Usuario no encontrado' });
      }
    }
  });
});


// Ruta para obtener información de un usuario por ID
app.get('/api/users/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Consulta la base de datos para obtener la información del usuario
    db.query('SELECT * FROM users WHERE id = ?', [userId], async (error, results) => {
      if (error) {
        console.error('Error al consultar la base de datos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else {
        if (results.length > 0) {
          const user = results[0];
          res.status(200).json(user); // Devuelve la información del usuario como respuesta
        } else {
          res.status(404).json({ error: 'Usuario no encontrado' });
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para crear un nuevo ticket
const generateTrackingId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let trackingId = '';

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    trackingId += characters.charAt(randomIndex);
  }

  trackingId += '-';

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    trackingId += numbers.charAt(randomIndex);
  }

  trackingId += '-';

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    trackingId += characters.charAt(randomIndex);
  }

  return trackingId;
};

app.put('/api/tickets/:ticketId', (req, res) => {
  const ticketId = req.params.ticketId;
  const { estado } = req.body;

  // Actualiza el estado del ticket en la base de datos solo si se proporciona un nuevo estado
  if (estado !== undefined) {
    const updateTicketQuery = 'UPDATE tickets SET estado = ? WHERE id = ?';

    db.query(updateTicketQuery, [estado, ticketId], (error, results) => {
      if (error) {
        console.error('Error al actualizar el ticket:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else {
        res.status(200).json({ message: 'Ticket actualizado con éxito' });
      }
    });
  } else {
    // Si no se proporciona un nuevo estado, simplemente devuelve una respuesta exitosa
    res.status(200).json({ message: 'Ticket actualizado con éxito' });
  }
});



app.post('/api/tickets', (req, res) => {
  const {
    creador,
    casa,
    prioridad,
    estado,
    asunto,
    descripcion,
    archivos_adjuntos,
    fecha_vencimiento,
    visible_cliente,
    sector,
    subsector,
    derivado, // Agrega el valor de "derivado" aquí

  } = req.body;

  // Verifica si el usuario creador y la casa existen en la base de datos
  const checkUserQuery = 'SELECT id FROM users WHERE id = ?';
  const checkHouseQuery = 'SELECT id FROM casa WHERE id = ?';

  db.query(checkUserQuery, [creador], (userError, userResults) => {
    if (userError) {
      console.error('Error al verificar el usuario:', userError);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (userResults.length === 0) {
      return res.status(400).json({ error: 'Usuario creador no encontrado' });
    }

    db.query(checkHouseQuery, [casa], (houseError, houseResults) => {
      if (houseError) {
        console.error('Error al verificar la casa:', houseError);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (houseResults.length === 0) {
        return res.status(400).json({ error: 'Casa no encontrada' });
      }

      // Genera el ID de seguimiento
      const trackingId = generateTrackingId();

      // Inserta el nuevo ticket en la base de datos
      const insertTicketQuery = `INSERT INTO tickets (creador, casa, prioridad, estado, asunto, descripcion, archivos_adjuntos, fecha_vencimiento, visible_cliente, tracking_id, sector, subsector, derivado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        insertTicketQuery,
        [
          creador,
          casa,
          prioridad,
          estado,
          asunto,
          descripcion,
          archivos_adjuntos,
          fecha_vencimiento,
          visible_cliente,
          trackingId,
          sector,
          subsector, // Agrega el valor de subsector aquí
          derivado, // Agrega el valor de "derivado" aquí
        ],
      (insertError, insertResults) => {
          if (insertError) {
            console.error('Error al insertar el ticket:', insertError);
            res.status(500).json({ error: 'Error interno del servidor' });
          } else {
            res.status(200).json({ message: 'Ticket creado con éxito' });
          }
        }
      );
    });
  });
});

app.get('/api/buscarusersderiva/:ids', (req, res) => {
  const ids = req.params.ids.split(',').map(id => id.trim());

  // Verificar que se hayan proporcionado IDs válidas
  if (ids.some(id => isNaN(id))) {
    return res.status(400).json({ error: 'IDs inválidas' });
  }

  console.log('IDs:', ids);

  // Consulta para buscar usuarios por las IDs, la columna "casa", y excluir los usuarios con cargo "cliente"
  const query = `
    SELECT * 
    FROM users 
    WHERE CONCAT(',', casa, ',') REGEXP ',(${ids.join('|')}),' AND cargo <> 'cliente'
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error al buscar usuarios:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.status(200).json({ users: results });
  });
});











// Enviar comentarios en json directamente a la base de datos
app.post('/api/tickets/:ticketId/comentarios', (req, res) => {
  const ticketId = req.params.ticketId;
  const { Comentario, creador, fecha } = req.body;

  // Consulta la columna "comentarios" actual del ticket
  db.query('SELECT comentarios FROM tickets WHERE id = ?', [ticketId], (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      let comentariosArray = [];

      if (results.length > 0) {
        const comentariosJson = results[0].comentarios;
        if (comentariosJson) {
          comentariosArray = JSON.parse(comentariosJson);
        }
      }

      // Verifica si comentariosArray es un array antes de usar push
      if (!Array.isArray(comentariosArray)) {
        comentariosArray = [];
      }

      // Agrega el nuevo comentario al array de comentarios
      comentariosArray.push({ Comentario, creador, fecha });

      // Convierte el array de comentarios de nuevo a JSON
      const nuevosComentariosJson = JSON.stringify(comentariosArray);

      // Actualiza la columna "comentarios" en la base de datos
      const updateComentariosQuery = 'UPDATE tickets SET comentarios = ? WHERE id = ?';

      db.query(updateComentariosQuery, [nuevosComentariosJson, ticketId], (updateError, updateResults) => {
        if (updateError) {
          console.error('Error al actualizar los comentarios:', updateError);
          res.status(500).json({ error: 'Error interno del servidor' });
        } else {
          res.status(200).json({ message: 'Comentario enviado y almacenado con éxito' });
        }
      });
    }
  });
});

// Obtener todos los jsons de comentarios
app.get('/api/tickets/:ticketId/comentarios', (req, res) => {
  const ticketId = req.params.ticketId;

  // Consulta la columna "comentarios" del ticket
  db.query('SELECT comentarios FROM tickets WHERE id = ?', [ticketId], (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      if (results.length > 0) {
        const comentariosJson = results[0].comentarios;

        if (comentariosJson) {
          const comentariosArray = JSON.parse(comentariosJson);
          res.status(200).json(comentariosArray);
        } else {
          res.status(200).json([]); // Si no hay comentarios, devuelve un array vacío
        }
      } else {
        res.status(404).json({ error: 'Ticket no encontrado' });
      }
    }
  });
});

// En tu servidor Node.js
app.post('/api/casas', (req, res) => {
  const { casaIds } = req.body; // Recibe la lista de IDs de casas desde el cuerpo de la solicitud

  // Consulta la base de datos para obtener información sobre las casas
  const getCasasQuery = 'SELECT id, nombre, sectores, subsectores FROM casa WHERE id IN (?)'; // Modifica la consulta según tu esquema de base de datos

  db.query(getCasasQuery, [casaIds], (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results); // Devuelve la información de las casas
    }
  });
});



app.get('/api/tickets/:casas', (req, res) => {
  const casas = req.params.casas.split(',');

  // Consulta la base de datos para obtener los tickets basados en las casas proporcionadas
  const getTicketsQuery = 'SELECT tickets.*, casa.nombre AS nombre_casa, users.nombre AS nombre_creador FROM tickets JOIN casa ON tickets.casa = casa.id JOIN users ON tickets.creador = users.id WHERE tickets.casa IN (?)';

  db.query(getTicketsQuery, [casas], (error, results) => {
    if (error) {
      console.error('Error al consultar la base de datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.status(200).json(results);
    }
  });
});

const port = process.env.PORT || 3001;

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`API HTTPS escuchando en el puerto ${port}`);
});
