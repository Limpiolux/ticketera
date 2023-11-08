const express = require('express');
const app = express();
const sql = require('mssql');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Configuración de conexión a SQL Server
const dbConfig = {
  user: 'emejias',
  password: 'Eloy.2023!',
  server: 'srv-prodsql-001',
  database: 'LimpioluxServicios_Prod',
  options: {
    trustServerCertificate: true
  }
};

// Configuración de conexión a MySQL
const createDBConnection = () => {
  return mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'root',
    database: 'ticketreact',
  });
};

const db = createDBConnection();

db.connect(err => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
  } else {
    console.log('Conexión exitosa a la base de datos');
  }
});


// Puerto en el que se ejecutará la API
const port = process.env.PORT || 3002;

async function migrateCasa() {
  try {
    // Conexión a SQL Server
    await sql.connect(dbConfig);

    // Consulta los datos de SQL Server, incluyendo la columna "Zona"
    const result = await sql.query('SELECT CONCAT(ClienteNombre, \' \', CasaNombre) AS nombre, Supervisor, Zona FROM dbo.ACC_ClienteCasa');

    // Cierra la conexión a SQL Server
    await sql.close();

    // Conexión a MySQL
    const connection = await mysql.createConnection(mysqlConfig);

    // Inserta los datos en MySQL con las transformaciones
    for (const row of result.recordset) {
      const { nombre, Supervisor, Zona } = row;
      // Inserta la columna "Zona" en la columna "zona" en MySQL
      await connection.query('INSERT INTO casa (nombre, supervisor, zona) VALUES (?, ?, ?)', [nombre, Supervisor, Zona]);
    }

    // Cierra la conexión a MySQL
    await connection.end();

    console.log('Datos transferidos con éxito a la tabla casa en MySQL');
  } catch (error) {
    console.error('Error al transferir datos a MySQL:', error);
  }
}


async function migrateSupervisors() {
  try {
    // Conexión a SQL Server
    await sql.connect(dbConfig);

    // Consulta los datos de SQL Server y realiza transformaciones
    const result = await sql.query('SELECT Nombre AS nombre, Email AS mail, Legajo FROM dbo.ACC_Supervisores');

    // Cierra la conexión a SQL Server
    await sql.close();

    // Conexión a MySQL
    const connection = await mysql.createConnection(mysqlConfig);

    // Elimina filas con email vacío o nulo
    const filteredData = result.recordset.filter((row) => row.mail && row.mail.trim() !== '');

    // Inserta los datos en MySQL con las transformaciones
    for (const row of filteredData) {
      const { nombre, mail, Legajo } = row;
      // Encripta la contraseña
      const hashedPassword = await bcrypt.hash('limpiolux2023', 10);
      
      // Busca las filas en la tabla 'casa' que coincidan con el 'Legajo' actual
      const [casaRows] = await connection.query('SELECT id FROM casa WHERE supervisor = ?', [Legajo]);

      // Obtiene los valores de 'id' y los concatena separados por comas
      const casaIds = casaRows.map((casaRow) => casaRow.id).join(',');

      // Inserta los datos en la tabla 'users' con la columna 'casa' actualizada
      await connection.query('INSERT INTO users (nombre, mail, contraseña, cargo, legajo, casa) VALUES (?, ?, ?, ?, ?, ?)', [nombre, mail, hashedPassword, 'supervisor', Legajo, casaIds]);
    }

    // Cierra la conexión a MySQL
    await connection.end();

    console.log('Datos de supervisores transferidos con éxito a la tabla users en MySQL');
  } catch (error) {
    console.error('Error al transferir datos de supervisores a MySQL:', error);
  }
}

async function migrateGerentesZonales() {
  try {
    // Conexión a SQL Server
    await sql.connect(dbConfig);

    // Consulta los datos de SQL Server
    const result = await sql.query('SELECT Legajo, Nombre, Zona, Email FROM dbo.ACC_GerentesZonales WHERE Email IS NOT NULL AND Email <> \'\'');

    // Cierra la conexión a SQL Server
    await sql.close();

    // Conexión a MySQL
    const connection = await mysql.createConnection(mysqlConfig);

    // Inserta los datos en MySQL con las transformaciones
    for (const row of result.recordset) {
      const { Legajo, Nombre, Zona, Email } = row;

      // Verifica si el correo existe en la tabla "users" de MySQL
      const [userExists] = await connection.query('SELECT 1 FROM users WHERE mail = ?', [Email]);

      if (userExists) {
        // Si el correo existe, actualiza la columna "zona" en MySQL
        await connection.query('UPDATE users SET zona = ? WHERE mail = ?', [Zona, Email]);
      }
    }

    // Cierra la conexión a MySQL
    await connection.end();

    console.log('Datos de Gerentes Zonales transferidos con éxito a la tabla users en MySQL');
  } catch (error) {
    console.error('Error al transferir datos de Gerentes Zonales a MySQL:', error);
  }
}

async function updateUsersCasaFromCasa() {
  try {
    // Conexión a MySQL
    const connection = await mysql.createConnection(mysqlConfig);

    // Consulta las filas de la tabla "users" con valores en la columna "zona"
    const [usersWithZona] = await connection.query('SELECT id, zona FROM users WHERE zona IS NOT NULL AND zona <> \'\'');

    // Consulta las filas de la tabla "casa" que coinciden con el valor de "zona" en "users"
    for (const user of usersWithZona) {
      const { id, zona } = user;

      // Consulta las IDs de las filas de "casa" que tienen el mismo valor en "zona"
      const [casaRows] = await connection.query('SELECT id FROM casa WHERE zona = ?', [zona]);

      // Obtiene las IDs existentes en la columna "casa" de "users"
      const [existingIds] = await connection.query('SELECT casa FROM users WHERE id = ?', [id]);

      // Separa y filtra las IDs para evitar duplicados
      const existingIdSet = new Set(existingIds[0].casa.split(',').map((id) => id.trim()));
      const newIds = casaRows.map((row) => row.id).filter((newId) => !existingIdSet.has(newId.toString()));

      // Concatena las nuevas IDs con las existentes
      const updatedCasa = existingIds[0].casa ? `${existingIds[0].casa},${newIds.join(',')}` : newIds.join(',');

      // Actualiza la columna "casa" en "users" con las nuevas IDs
      await connection.query('UPDATE users SET casa = ? WHERE id = ?', [updatedCasa, id]);
    }

    // Cierra la conexión a MySQL
    await connection.end();

    console.log('Actualización de la columna "casa" en la tabla "users" completada con éxito');
  } catch (error) {
    console.error('Error al actualizar la columna "casa" en la tabla "users":', error);
  }
}

async function getAllCasaIds() {
  try {
    // Conexión a MySQL
    const connection = await mysql.createConnection(mysqlConfig);

    // Consulta todas las filas de la tabla "casa"
    const [casaRows] = await connection.query('SELECT id FROM casa');

    // Obtiene los IDs como una cadena separada por comas
    const casaIds = casaRows.map((row) => row.id).join(',');

    // Muestra los IDs en la consola
    console.log('IDs de las casas:', casaIds);

    // Cierra la conexión a MySQL
    await connection.end();
  } catch (error) {
    console.error('Error al obtener los IDs de las casas:', error);
  }
}

// Llama a las funciones para mover datos
async function main() {
  await migrateCasa();
  await migrateSupervisors();
  await migrateGerentesZonales();
  await updateUsersCasaFromCasa();
  await getAllCasaIds();
  app.listen(port, () => {
    console.log(`API en ejecución en el puerto ${port}`);
  });
}

// Ejecuta las funciones principales
main();
