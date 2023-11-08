import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { AiOutlinePlus, AiOutlineUserAdd, AiOutlineContacts, AiOutlineHome, AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import { Button } from "@nextui-org/react";


function Register() {
  const [userData, setUserData] = useState(null);
  const [selectedOption, setSelectedOption] = useState('Todos');
  const [casasData, setCasasData] = useState(null);
  const [casa, setCasa] = useState('default');
  const [prioridad, setPrioridad] = useState('default');
  const [estado, setEstado] = useState('default');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [archivos_adjuntos, setArchivosAdjuntos] = useState("");
  const [fecha_vencimiento, setFechaVencimiento] = useState('');
  const [visible_cliente, setVisibleCliente] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [ticketsData, setTicketsData] = useState(null); // Agrega el estado para almacenar los tickets
  const [archivosAdjuntosBase64, setArchivosAdjuntosBase64] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [sector, setSector] = useState("default");
  const [sectores, setSectores] = useState([]);
  const [subsector, setSubsector] = useState("default");
  const [subsectores, setSubsectores] = useState([]);
  const [comentario, setComentario] = useState('');

  const [selectedEstado, setSelectedEstado] = useState(selectedTicket?.estado);

  const [comentariosArray, setComentariosArray] = useState([]);
  useEffect(() => {
    const obtenerComentarios = async () => {
      try {
        const response = await fetch(`https://servicios.grupolimpiolux.com.ar:3001/api/tickets/${selectedTicket?.id}/comentarios`);
        if (response.ok) {
          const data = await response.json();
          setComentariosArray(data);
        } else {
          console.error('Error al obtener los comentarios:', response.statusText);
        }
      } catch (error) {
        console.error('Error al obtener los comentarios:', error);
      }
    };

    obtenerComentarios();
  }, [selectedTicket]);

  const handleComentarioChange = (event) => {
    setComentario(event.target.value);
  };

  const handleEnviarComentario = async () => {
    if (!comentario) {
      // No se envía el comentario si está vacío
      return;
    }

    try {
      const fechaActual = new Date(); // Obtener la fecha y hora actual
      const fechaFormateada = fechaActual.toLocaleString(); // Formatear la fecha y hora como una cadena legible

      const response = await fetch(`https://servicios.grupolimpiolux.com.ar:3001/api/tickets/${selectedTicket?.id}/comentarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Comentario: comentario,
          creador: userData.nombre,
          fecha: fechaFormateada, // Agregar la fecha y hora formateada
        }),
      });

      if (response.ok) {
        // Comentario enviado con éxito, puedes actualizar la página o realizar alguna acción adicional
        console.log('Comentario enviado con éxito');
        // Puedes limpiar el textarea después de enviar el comentario
        setComentario('');
      } else {
        const data = await response.text();
        console.error('Error al enviar el comentario:', data);
        alert(`Error: ${data}`);
      }
    } catch (error) {
      console.error('Error al enviar el comentario:', error);
      alert('Error interno del servidor');
    }
  };




  const handleEstadoChange = (e) => {
    setSelectedEstado(e.target.value);
  };

  const handleUpdateTicket = async () => {
    try {
      const response = await fetch(`https://servicios.grupolimpiolux.com.ar:3001/api/tickets/${selectedTicket?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: selectedEstado }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const data = await response.text(); // Obtener el cuerpo de la respuesta
        console.error('Error al actualizar el ticket:', data);
        alert(`Error: ${data}`);
      }
    } catch (error) {
      console.error('Error al actualizar el ticket:', error);
      alert('Error interno del servidor');
    }
  };


  function handleOnEnter(text) {
    console.log('enter', text)
  }

  useEffect(() => {
    if (casa !== "default") {
      const selectedCasa = casasData.find(c => c.id === parseInt(casa));
      if (selectedCasa) {
        const sectoresArray = selectedCasa.sectores.split(",");
        setSectores(sectoresArray);
      }
    } else {
      setSectores([]);
    }
  }, [casa, casasData]);

  useEffect(() => {
    if (casa !== "default") {
      const selectedCasa = casasData.find(c => c.id === parseInt(casa));
      if (selectedCasa) {
        const subsectoresArray = selectedCasa.subsectores.split(",");
        setSubsectores(subsectoresArray);
      }
    } else {
      setSubsectores([]);
    }
  }, [casa, casasData]);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    const user = JSON.parse(userString);
    setUserData(user);

    const casaIdsArray = user.casa.split(',').map(id => parseInt(id.trim(), 10));
    const requestBody = {
      casaIds: casaIdsArray,
    };

    const handleEstadoChange = (event) => {
      const newEstado = event.target.value;
      const updatedTicket = { ...selectedTicket, estado: newEstado };

      // Envía los datos actualizados al endpoint
      fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTicket),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Ticket actualizado:', data);
          // Realiza cualquier acción después de actualizar el ticket
        })
        .catch((error) => {
          console.error('Error al actualizar el ticket:', error);
          // Maneja el error de actualización del ticket
        });
    };

    fetch('https://servicios.grupolimpiolux.com.ar:3001/api/casas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Error en la solicitud');
        }
      })
      .then(data => {
        setCasasData(data);
      })
      .catch(error => {
        console.error('Error al obtener datos de las casas:', error);
      });


    if (user && user.casa) {
      fetch(`https://servicios.grupolimpiolux.com.ar:3001/api/tickets/${user.casa}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error('Error en la solicitud');
          }
        })
        .then(data => {
          setTicketsData(data);
        })
        .catch(error => {
          console.error('Error al obtener los tickets:', error);
        });
    }
  }, []);



  const [selectedHouses, setSelectedHouses] = useState([]);


  const handleHouseChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setSelectedHouses((prevSelectedHouses) => [...prevSelectedHouses, value]);
    } else {
      setSelectedHouses((prevSelectedHouses) =>
        prevSelectedHouses.filter((houseId) => houseId !== value)
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedHouses.length === 0) {
      // Si no se ha seleccionado ninguna casa, mostrar un alert
      alert('Debes seleccionar al menos una casa.');
      return;
    }

    const formData = {
      nombre: e.target.name.value,        // Corregido a "nombre"
      email: e.target.email.value,        // Corregido a "email"
      password: e.target.password.value,  // Corregido a "password"
      cargo: e.target.cargo.value,        // Corregido a "cargo"
      casa: selectedHouses.join(','),    // Convertir las casas seleccionadas en una cadena separada por comas
    };

    try {
      const response = await fetch('https://servicios.grupolimpiolux.com.ar:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Éxito: recarga la página
        window.location.reload();
      } else {
        // Manejo de errores aquí
        console.error('Error al enviar el formulario');
      }
    } catch (error) {
      // Manejo de errores de red aquí
      console.error('Error de red al enviar el formulario', error);
    }
  };

  const [busqueda, setBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState(false);
    
  const handleInputChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleSearchClick = () => {
    setBusquedaActiva(true);
  };

  const handleClearClick = () => {
    setBusqueda('');
    setBusquedaActiva(false);
  };

  return (
    <div>
      <section class="bg-white dark:bg-gray-900">
        <div class="py-8 px-4 mx-auto max-w-2xl lg:py-16">
          <h2 class="mb-4 text-xl font-bold text-gray-900 dark:text-white">Crear un nuevo usuario</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Nombre</label>
                <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Escriba un nombre" required />
              </div>
              <div className="w-full">
                <label htmlFor="brand" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                <input type="text" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Escriba un email" required />
              </div>
              <div className="w-full">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                <input type="password" name="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Escriba una contraseña" required />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cargo</label>
                <select id="countries" name="cargo" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                  <option value="Supervisor">Supervisor</option>
                  <option value="Empleado">Empleado</option>
                  <option value="Cliente">Cliente</option>
                </select>
                
<div class="flex items-center" style={{ marginTop: '20px' }}>   
    <label for="simple-search" class="sr-only">Search</label>
    <div class="relative w-full">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
<AiOutlineHome />
        </div>
        
        <input                 
 type="text" value={busqueda}
 onChange={handleInputChange} id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar casas..."/>
    </div>
    <button         onClick={handleSearchClick}
 style={{ backgroundColor: '#0075a9' }} type="submit" class="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
<AiOutlineSearch/>
    </button>
    <button         onClick={handleClearClick}
style={{ backgroundColor: '#0075a9' }} type="submit" class="p-2.5 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
    <AiOutlineClose/>

    </button>
</div>

              </div>
              <div className="sm:col-span-2">
              <div className="flex flex-col space-y-4">
              <Button style={{ backgroundColor: '#0075a9', color: 'white', marginRight: '10px', marginTop: '10px' }} type="submit">
              <AiOutlineUserAdd /> Crear usuario
            </Button>
            <div class="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
  <svg class="flex-shrink-0 inline w-4 h-4 mr-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
  </svg>
  <span class="sr-only">Info</span>
  <div>
Recuerda ingresar al menos una casa</div>
</div>
  {casasData &&
    casasData.map((casa) => {
      const nombreCasa = casa.nombre.toLowerCase();
      const busquedaLowerCase = busqueda.toLowerCase();

      if (busquedaActiva && !nombreCasa.includes(busquedaLowerCase)) {
        return null; // No mostrar la casa si no coincide con la búsqueda
      }

      return (
        <div key={casa.id} className={`flex items-center`}>
          <input
            id={`checkbox-${casa.id}`}
            type="checkbox"
            name="casas"
            value={casa.id}
            onChange={handleHouseChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`checkbox-${casa.id}`}
            className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            {casa.nombre}
          </label>
        </div>
      );
    })}
</div>

              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Register;
