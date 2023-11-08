import React, { useState, useEffect } from 'react';
import "flowbite/dist/flowbite.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import {
  Button, Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
} from "@nextui-org/react";
import { DropdownItem, DropdownTrigger, Dropdown, DropdownMenu, Avatar } from "@nextui-org/react";
import { AiOutlineUser, AiOutlineMail, AiOutlineCluster, AiOutlineTool, AiOutlineClose, AiOutlineEdit, AiOutlineCheckCircle } from "react-icons/ai";
import { AiOutlineLogout } from "react-icons/ai";
import { TbLockOpen, TbLockPlus, TbLockQuestion } from "react-icons/tb";
import Tickets from './Tickets';

function NavbarDashboard() {
  const handleLogout = () => {
    // Elimina el token del almacenamiento local
    localStorage.clear();
    // Redirige al usuario a la página de inicio de sesión
    window.location.href = '/';
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
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



  const handleSubmit = (event) => {
    event.preventDefault();

    if (casa === 'default' || prioridad === 'default' || estado === 'default' || !asunto || !descripcion || sector === 'default' || subsector === 'default') {
      setShowAlert(true);
      return;
    }

    const requestBody = {
      creador: userData.id,
      casa,
      prioridad,
      estado,
      asunto,
      descripcion,
      archivos_adjuntos: archivosAdjuntosBase64, // Usar la variable de base64
      fecha_vencimiento,
      visible_cliente,
      sector,
      subsector
    };

    fetch('https://servicios.grupolimpiolux.com.ar:3001/api/tickets', {
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
        console.log('Ticket creado:', data);
        window.location.reload(); // Recarga la página
      })
      .catch(error => {
        console.error('Error al crear el ticket:', error);
      });
  };


  const menuItems = [
    "Tickets",
    "Usuario",
    "Activity",
  ];
  

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [error, setError] = useState(''); // Inicializado con un mensaje de error predeterminado


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`https://servicios.grupolimpiolux.com.ar:3001/api/changepassword/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'Contraseña actualizada con éxito') {
          // Recargar la página si la contraseña se actualiza con éxito
          window.location.reload();
        }
      } else if (response.status === 401) {
        // Mostrar mensaje de error si la respuesta es 401
        setError('La contraseña actual es incorrecta');
      } else {
        console.error('Error al cambiar la contraseña');
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
    }
  };
  return (
    <>

      <Navbar onMenuOpenChange={setIsMenuOpen} isBordered>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <NavbarBrand>
              <Link href="/inicio">
                <img src="limpiolux-icon.svg" class="h-8 mr-3" alt="Flowbite Logo" />
              </Link>
            </NavbarBrand>        </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="/inicio">
              Tickets
            </Link>
          </NavbarItem>
          {userData && userData.cargo === 'administrador' ? (
            <NavbarItem>
              <Link href="/usuarios" color="foreground">
                Usuarios
              </Link>
            </NavbarItem>
          ) : null}
        </NavbarContent>
        <NavbarContent justify="end">

          <NavbarItem>
            <Button as={Link} color="danger" href="#" onClick={handleLogout} size="m" variant="flat">
              <AiOutlineLogout /> Salir
            </Button>
          </NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                classNames={{
                  base: "bg-gradient-to-br from-[#0075a9] to-[#0075a9]",
                  text: "text-black/80",
                }}
                isBordered
                as="button"
                className="transition-transform"
                color="secondary"
                name={userData ? userData.nombre : ''}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile">
                <p className="font-semibold">Perfil</p>
              </DropdownItem>
              <DropdownItem > <AiOutlineUser style={{ display: 'inline-block', marginRight: '5px', marginTop: "-2.5px" }} />
                {userData ? userData.nombre : ''}</DropdownItem>
              <DropdownItem > <AiOutlineMail style={{ display: 'inline-block', marginRight: '5px', marginTop: "-2.5px" }} />
                {userData ? userData.mail : ''}</DropdownItem>
              <DropdownItem>
                <AiOutlineCluster style={{ display: 'inline-block', marginRight: '5px', marginTop: '-2.5px' }} />
                {userData ? userData.cargo.charAt(0).toUpperCase() + userData.cargo.slice(1) : ''}
              </DropdownItem>
              <DropdownItem data-bs-toggle="modal" data-bs-target="#PasswordModal">
                <TbLockOpen style={{ display: 'inline-block', marginRight: '5px', marginTop: '-2.5px' }} />
                <span style={{ color: '#0075a9' }}>Cambiar contraseña</span>
              </DropdownItem>


            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
        <NavbarMenu>
          <NavbarMenuItem>
            <Link
              color="primary"
              className="w-full"
              href="/inicio"
              size="lg"
            >
              Tickets
            </Link>
          </NavbarMenuItem>
          {userData && userData.cargo === 'administrador' ? (

            <NavbarMenuItem>
              <Link
                color="primary"
                className="w-full"
                href="/usuarios"
                size="lg"
              >
                Usuarios
              </Link>
            </NavbarMenuItem>
          ) : null}
        </NavbarMenu>
      </Navbar>

      <div class="modal fade" id="PasswordModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">Cambiar contraseña</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><AiOutlineClose /></button>
            </div>
            <form onSubmit={handleSubmitPassword}>
      <div className="modal-body">
        <div className="mb-6">
          <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
            Contraseña Actual
          </label>
          <input
            type="password"
            name="currentPassword"
            id="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
            Nueva Contraseña
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="•••••••••"
            required
          />
        </div>
        {error && (
        <div className="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert" >
          <AiOutlineEdit style={{ marginRight: '5px' }} />
          {error}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"><AiOutlineClose /></button>
        </div>
      )}
      </div>
      
      <div className="modal-footer">
        <Button type="button" variant="flat" color='danger' data-bs-dismiss="modal">Cerrar</Button>
        <Button
          type="submit"
          className="text-white"
          style={{ backgroundColor: '#0075a9' }}
        >
          <AiOutlineEdit />
          Enviar
        </Button>
      </div>
    </form>
          </div>
        </div>
      </div>
      {/*
    <div>
        <h2>Perfil de Usuario</h2>
        {userData ? (
          <div>
            <p>ID: {userData.id}</p>
            <p>Nombre: {userData.nombre}</p>
            <p>Email: {userData.mail}</p>
            <p>Cargo: {userData.cargo}</p>
            <p>Casa: {userData.casa}</p>
            {casasData ? (
              <div>
                <h2>Información de las Casas</h2>
                <ul>
                  {casasData.map(casa => (
                    <li key={casa.id}>
                      ID: {casa.id}, Nombre: {casa.nombre}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No se encontró información de las casas.</p>
            )}        </div>
        ) : (
          <p>No se encontraron datos del usuario.</p>
        )}
      </div>
      */
      }
    </>
  );
}

export default NavbarDashboard; 