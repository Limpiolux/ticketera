import { useEffect, useState } from 'react';
import { Button, Table, ButtonGroup, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Input } from '@nextui-org/react';
import { AiOutlinePlus, AiFillEye, AiOutlineSortAscending, AiOutlineMail, AiOutlineSend, AiOutlineMessage, AiOutlineTeam, AiOutlineUpload, AiOutlineWarning, AiOutlineClose, AiOutlineHome, AiOutlineForm, AiOutlineInfoCircle, AiOutlineCamera, AiOutlineReconciliation, AiOutlineApartment, AiOutlineEye, AiOutlineOrderedList, AiOutlineCalendar } from "react-icons/ai"
import "bootstrap/dist/css/bootstrap.min.css";
import { Dropdown, Link, DropdownSection, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { CgTemplate } from "react-icons/cg";
import { TiInfoLarge } from "react-icons/ti";
import { MdOutlineAutoGraph } from "react-icons/md";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { Card, Title, DonutChart, BarChart, Subtitle } from "@tremor/react";
import React from "react";
import * as XLSX from 'xlsx';
import { SiAdobeacrobatreader } from "react-icons/si";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function Tickets() {
  const [userData, setUserData] = useState("");
  const [selectedOption, setSelectedOption] = useState('Todos');

  const [casasData, setCasasData] = useState("");
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
  const [derivado, setDerivado] = useState('default');
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

    if (casa === 'default' || prioridad === 'default' || estado === 'default' || !asunto || !descripcion || sector === 'default' || subsector === 'default' || derivado === 'default' ) {
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
      subsector,
      derivado
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

  
  function handleTemplateChange(selectedTemplate) {
    if (selectedTemplate === "Sin plantilla") {
      setAsunto("");
      setDescripcion("");
    } else if (selectedTemplate === "Solicitud de Insumos") {
      setAsunto("Solicitud de Insumos");
      setDescripcion("Solicito suministros de limpieza para el área de [nombre del área] debido a la escasez actual. Necesitamos [lista de insumos] para mantener la limpieza eficiente.");
    } else if (selectedTemplate === "Limpieza Urgente") {
      setAsunto("Limpieza Urgente");
      setDescripcion("Hay una situación urgente de limpieza en [nombre del sitio]. Se necesita atención inmediata debido a [razón de la emergencia, como un derrame]. Por favor, envíe un equipo de limpieza de inmediato");
    } else if (selectedTemplate === "Mantenimiento Programado") {
      setAsunto("Mantenimiento Programado");
      setDescripcion("Planificamos realizar una limpieza programada en [nombre del sitio] el [fecha y hora]. El trabajo incluirá limpieza profunda y desinfección. Por favor, coordine el equipo necesario.");
    }
    // Puedes agregar más plantillas y lógica aquí
  }
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Define la función para hacer la solicitud a la API
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://servicios.grupolimpiolux.com.ar:3001/api/buscarusersderiva/${userData.casa}`);
        if (!response.ok) {
          throw new Error('No se pudo cargar la lista de usuarios.');
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error(error);
        // Manejo de errores aquí
      } finally {
        setIsLoading(false);
      }
    };

    // Llama a la función para cargar los usuarios cuando userData.casa cambie
    if (userData.casa) {
      fetchUsers();
    }
  }, [userData.casa]);

  let abiertoCount = 0;
let cerradoCount = 0;
let enProgresoCount = 0;
let totalTickets = 0;

  
ticketsData &&
  ticketsData.forEach((ticket) => {
    // Verifica si el usuario es un cliente y si el ticket no debe ser visible para los clientes
    if (userData.cargo === 'cliente' && ticket.visible_cliente === 0) {
      // No incrementa los contadores
      return;
    }

    // Incrementa el contador total de tickets
    totalTickets++;

    // Incrementa el contador según el estado del ticket
    if (ticket.estado === 'Abierto') {
      abiertoCount++;
    } else if (ticket.estado === 'Cerrado') {
      cerradoCount++;
    } else if (ticket.estado === 'En progreso') {
      enProgresoCount++;
    }
  });

// Crea el array ticketsparadatos después de contar los tickets
const ticketsparadatos = [
  {
    name: "Cerrado",
    sales: cerradoCount,
  },
  {
    name: "En progreso",
    sales: enProgresoCount,
  },
  {
    name: "Abierto",
    sales: abiertoCount,
  },
];

    const [value, setValue] = React.useState(null);

    const casasConteo = {};

    // Mapea los tickets para realizar el conteo
    ticketsData &&
      ticketsData.forEach((ticket) => {
        // Verifica si el usuario es un cliente y si el ticket no debe ser visible para los clientes
        if (userData.cargo === 'cliente' && ticket.visible_cliente === 0) {
          // No incrementa el contador
          return;
        }
    
        const nombreCasa = ticket.nombre_casa;
    
        // Incrementa el contador de tickets para la casa correspondiente
        if (casasConteo[nombreCasa]) {
          casasConteo[nombreCasa]++;
        } else {
          casasConteo[nombreCasa] = 1;
        }
      });
    
    // Crea el array casaparadata a partir del objeto de conteo
    const casaparadata = Object.entries(casasConteo).map(([nombreCasa, cantidadTickets]) => ({
      name: nombreCasa,
      sales: cantidadTickets,
    }));

    const exportToExcel = () => {
      // Crea una copia de los datos y modifica el contenido de las celdas según tus preferencias
      const modifiedData = ticketsData.map((ticket) => ({
        ID: ticket.id, // Cambia el nombre de la primera columna de "id" a "ID"
        'N° de Seguimiento': ticket.tracking_id, // Cambia el nombre de la columna
        Casa: ticket.nombre_casa, // Cambia el nombre de la columna
        Creador: ticket.nombre_creador, // Cambia el nombre de la columna
        Asunto: ticket.asunto,
        Descripcion: ticket.descripcion,
        Estado: ticket.estado,
        Prioridad: ticket.prioridad,
        Sector: ticket.sector,
        Subsector: ticket.subsector,
        Derivado: ticket.derivado,
        'Fecha de vencimiento': new Date(ticket.fecha_vencimiento)
          .toLocaleDateString()
          .split('-')
          .reverse()
          .join('-'),
      }));
  
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(modifiedData);
  
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tabla de Tickets');
  
      const excelArray = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
      const blob = new Blob([excelArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tickets.xlsx';
      a.click();
  
      URL.revokeObjectURL(url);
    };


    const exportToPDF = () => {
      if (!selectedTicket) {
        alert('No se ha seleccionado un ticket.');
        return;
      }
    
      const pdf = new jsPDF();
      let yPosition = 10; // Posición vertical inicial
      const pageHeight = pdf.internal.pageSize.height;
      const maxTextWidth = 180; // Ancho máximo antes de dividir el texto
    
      const addPageIfNeeded = (heightToAdd) => {
        if (yPosition + heightToAdd > pageHeight - 20) {
          pdf.addPage();
          yPosition = 10;
        }
      };

// Agrega la imagen al principio del PDF
const image = new Image();
image.src = '/limpiolux-icon.png'; // Ruta a la imagen en la carpeta "public"
pdf.addImage(image, 'PNG', 10, yPosition, 0, 20); // Ancho de la imagen (0) y ajusta solo la posición vertical
yPosition += 30; // Ajusta la posición vertical después de la imagen
    
      // Agrega el contenido al PDF, excluyendo el archivo adjunto
      pdf.text(`Número de seguimiento: ${selectedTicket.tracking_id}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
// Texto a mostrar, incluyendo la etiqueta "Casa"
const casaText = `Casa: ${selectedTicket.nombre_casa}`;

// Divide el texto en múltiples líneas si es necesario
const casaTextLines = pdf.splitTextToSize(casaText, maxTextWidth);

// Itera sobre las líneas del texto y las agrega al PDF
casaTextLines.forEach((line) => {
  pdf.text(line, 10, yPosition);
  yPosition += 10;
  addPageIfNeeded(10);
});

    
      pdf.text(`Prioridad: ${selectedTicket.prioridad}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
      pdf.text(`Estado: ${selectedTicket.estado}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
      pdf.text(`Sector: ${selectedTicket.sector}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
      pdf.text(`Subsector: ${selectedTicket.subsector}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
      pdf.text(`Asunto: ${selectedTicket.asunto}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
      // Divide la descripción en múltiples líneas
      const descriptionLines = pdf.splitTextToSize(selectedTicket.descripcion, maxTextWidth);
      pdf.text('Descripción:', 10, yPosition);
      yPosition += 10;
    
      // Agrega la descripción línea por línea
      descriptionLines.forEach((line) => {
        addPageIfNeeded(10);
        pdf.text(line, 10, yPosition);
        yPosition += 10;
      });
    
      addPageIfNeeded(10);
    
      pdf.text(`Fecha de vencimiento: ${selectedTicket.fecha_vencimiento}`, 10, yPosition);
      yPosition += 10;
      addPageIfNeeded(10);
    
      pdf.text(`Derivado a: ${selectedTicket.derivado}`, 10, yPosition);
      yPosition += 10;
    
      // Agrega una página en blanco para el archivo adjunto
      pdf.addPage();
      yPosition = 10;
    
      // Verifica si hay una cadena base64 para el archivo adjunto (acepta JPEG, JPG y PNG)
      if (selectedTicket.archivos_adjuntos) {
        const imageWidth = 180; // Ancho de la imagen en el PDF
        const imageHeight = 180; // Alto de la imagen en el PDF
    
        // Verifica si la cadena base64 comienza con la cabecera de JPEG, JPG o PNG
        if (selectedTicket.archivos_adjuntos.startsWith('data:image/jpeg') || selectedTicket.archivos_adjuntos.startsWith('data:image/jpg')) {
          pdf.addImage(selectedTicket.archivos_adjuntos, 'JPEG', 10, yPosition, imageWidth, imageHeight);
        } else if (selectedTicket.archivos_adjuntos.startsWith('data:image/png')) {
          pdf.addImage(selectedTicket.archivos_adjuntos, 'PNG', 10, yPosition, imageWidth, imageHeight);
        }
      }
    
      // Guarda el PDF o abre una nueva ventana del navegador para mostrarlo
      pdf.save('ticket.pdf');
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setArchivosAdjuntosBase64(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const eliminarImagen = () => {
      setArchivosAdjuntosBase64(null);
      document.getElementById('file_input').value = ''; // Vaciar el input
    };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: "10px" }}>
        <Button style={{ backgroundColor: '#0075a9', color: 'white', marginRight: '10px', marginLeft: "10px" }} data-bs-toggle="modal" data-bs-target="#exampleModal">
          <AiOutlinePlus /> <p style={{ marginRight: '5px' }}>Crear ticket</p>
        </Button>

        <Dropdown>
          <DropdownTrigger>
            <Button
              variant="bordered"
            >
              <AiOutlineSortAscending />  <p style={{ marginRight: '5px' }}>Filtrar ticket: {selectedOption}</p> 
            </Button>
          </DropdownTrigger>

          <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="todos" onClick={() => setSelectedOption('Todos')}>
              Todos
            </DropdownItem>
            <DropdownItem key="abierto" onClick={() => setSelectedOption('Abierto')}>
              Abierto
            </DropdownItem>
            <DropdownItem key="cerrado" onClick={() => setSelectedOption('Cerrado')}>
              Cerrado
            </DropdownItem>
            <DropdownItem key="progreso" onClick={() => setSelectedOption('En progreso')}>
              En Progreso
            </DropdownItem>
          </DropdownMenu>

        </Dropdown>

        <Button style={{ backgroundColor: '#00a144', color: 'white', marginRight: '10px', marginLeft: '10px' }} data-bs-toggle="modal" data-bs-target="#exampleModal3">
          <MdOutlineAutoGraph /> <p style={{ marginRight: '5px' }}>Reporte tickets</p>
        </Button>

      </div>

      <div class="modal fade" id="exampleModal3" tabindex="-1" aria-labelledby="exampleModalLabel2" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Visualizar tickets</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><AiOutlineClose /></button>
      </div>
      <div class="modal-body">
      <Card className="max-w-lg">
    <Title>Por estados:</Title>
    <DonutChart
      className="mt-6"
      data={ticketsparadatos}
      category="sales"
      index="name"
      colors={["red", "green", "teal", "rose", "cyan", "amber"]}
      onValueChange={(v) => setValue(v)}
    />
      </Card>

      <Card className="max-w-lg" style={{ marginTop: "20px" }}>

      <Title>Por casa:</Title>
    <DonutChart
      className="mt-6"
      data={casaparadata}
      category="sales"
      index="name"
      colors={["blue", "violet", "indigo", "rose", "cyan", "amber"]}
      onValueChange={(v) => setValue(v)}
    />
      </Card>

      </div>
      <div class="modal-footer">
      <Button type="button" variant="flat" color='danger' data-bs-dismiss="modal">Cerrar</Button>
      <Button onClick={exportToExcel} type="button" className='text-white' style={{ backgroundColor: '#00a144' }}><PiMicrosoftExcelLogoFill />Exportar tickets</Button>
      </div>
    </div>
  </div>
</div>

      <div style={{ margin: "15px" }}>

        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel" style={{ display: 'flex', alignItems: 'center' }}>
                  Crear ticket
                </h1>        <button type="button" data-bs-dismiss="modal" aria-label="Close"> <AiOutlineClose /></button>
              </div>
              <div className="modal-body">

                <form onSubmit={handleSubmit}>
                  <div class="grid gap-6 mb-6 md:grid-cols-2">
                    <div>
                      <label for="casas" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
                        <AiOutlineHome className="mr-1" /> Casa
                      </label>
                      <select
                        id="casas"
                        value={casa}
                        onChange={(event) => setCasa(event.target.value)}
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="default">Selecciona una casa</option>
                        {/* Verifica si casasData es válido antes de mapear */}
                        {casasData && casasData.map(casa => (
                          <option key={casa.id} value={casa.id}>
                            {casa.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineInfoCircle className="mr-1" />Prioridad</label>
                      <select
                        id="prioridad"
                        value={prioridad}
                        onChange={(event) => setPrioridad(event.target.value)}
                        required
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="default">Selecciona la prioridad</option>
                        <option>Baja</option>
                        <option>Media</option>
                        <option>Alta</option>
                        <option>Crítica</option>
                      </select></div>
                    <div>
                      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineOrderedList className="mr-1" />Estado</label>
                      <select
                        required
                        id="estado"
                        value={estado}
                        onChange={(event) => setEstado(event.target.value)}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="default">Selecciona el estado</option>        <option>Abierto</option>
                        <option>Cerrado</option>
                        <option>En progreso</option>
                      </select></div>

                    <div>
                      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineApartment className="mr-1" />Sector</label>
                      <select
                        id="sectores"
                        value={sector}
                        onChange={(event) => setSector(event.target.value)}
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="default">Selecciona un sector</option>
                        {sectores.map((sector, index) => (
                          <option key={index} value={sector}>
                            {sector}
                          </option>
                        ))}
                      </select></div>

                    <div>
                      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineApartment className="mr-1" />Subsector</label>
                      <select
                        id="subsectores"
                        value={subsector}
                        onChange={(event) => setSubsector(event.target.value)}
                        required
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value="default">Selecciona un subsector</option>
                        {subsectores.map((subsector, index) => (
                          <option key={index} value={subsector}>
                            {subsector}
                          </option>
                        ))}
                      </select></div>

                      <div>
                      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><CgTemplate className="mr-1" />Plantilla de mensaje</label>

  <select
  id="template"
  onChange={(event) => handleTemplateChange(event.target.value)}
  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
>
  <option value="Sin plantilla">Sin plantilla</option>
  <option value="Solicitud de Insumos">Solicitud de Insumos</option>
  <option value="Limpieza Urgente">Limpieza Urgente</option>
  <option value="Mantenimiento Programado">Mantenimiento Programado</option>
  {/* Agrega más opciones de plantilla según sea necesario */}
</select>

</div>


                  </div>
                  <div class="mb-6">
                      <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineMail className="mr-1" />Asunto</label>
                      <input
                        type="text"
                        id="asunto"
                        value={asunto}
                        maxLength="22"
                        onChange={(event) => setAsunto(event.target.value)}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Titulo del ticket"
                        required
                      />
<p
  className="mt-1 text-sm text-gray-500 dark:text-gray-300 mb-6"
  id="file_input_help"
  style={{ display: 'flex', alignItems: 'center' }}
>
  <span><TiInfoLarge/></span>
  <span>Número máximo de caracteres: 22.</span>
</p>
                    </div>
                  <div class="mb-6">
                    <label for="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineForm className="mr-1" /> Descripción</label>
                    <textarea
                      id="descripcion"
                      required
                      rows="4"
                      value={descripcion}
                      onChange={(event) => setDescripcion(event.target.value)}
                      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Escriba los detalles..."
                    ></textarea> 
   </div>
                  <div class="mb-6">



                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineCamera className="mr-1" /> Subir foto</label>
                    <input
                      accept="image/png, image/jpeg, image/jpg"
                      class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                      aria-describedby="file_input_help"
                      id="file_input"
                      type="file"
                      onChange={handleFileChange}
                    />
<p
  className="mt-1 text-sm text-gray-500 dark:text-gray-300 mb-6"
  id="file_input_help"
  style={{ display: 'flex', alignItems: 'center' }}
>
  <span><TiInfoLarge/></span>
  <span>Formatos aceptados: JPG, JPEG, PNG</span>
</p>                    <div>
                      {archivosAdjuntosBase64 && (
                        <div>
                        <img src={archivosAdjuntosBase64} alt="Imagen adjunta" style={{ marginTop: '-10px', marginBottom: '12px' }} />
                        <button class="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" onClick={eliminarImagen} style={{ marginTop: "15px", marginBottom: "15px" }}>Eliminar imagen</button> 
                        </div>
                      )}
                    </div>
                    <div class="mb-6">
                      <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineTeam className="mr-1" />Derivar ticket</label>
                      <select
                        required
                        id="derivado"
                        value={derivado}
                        onChange={(event) => setDerivado(event.target.value)}
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
    <option value="default">Selecciona una persona</option>
    {users.map((user) => (
      <option key={user.nombre} value={user.nombre}>
        {user.nombre}
      </option>
    ))}
                      </select></div>

                    <div></div>
                  </div>
                  <div class="mb-6">
                    <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineMail className="mr-1" />Fecha de vencimiento</label>
                    <input
                      required
                      type="date"
                      id="fecha_vencimiento"
                      value={fecha_vencimiento}
                      onChange={(event) => setFechaVencimiento(event.target.value)} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' name="birthday" />
                  </div>
                  <div class="flex items-start mb-6">
                    {userData && userData.cargo !== 'cliente' && (
                      <div class="flex items-center h-5">
                        <input
                          id="visible_cliente"
                          type="checkbox"
                          checked={visible_cliente}
                          onChange={(event) => setVisibleCliente(event.target.checked)}
                          class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                        />
                        <label for="remember" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Visible para el cliente</label>
                      </div>
                    )}
                  </div>

                  {showAlert && (
                    <div class="alert alert-danger alert-dismissible fade show d-flex align-items-center" role="alert">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                      Por favor, completa todos los datos.
                      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"><AiOutlineClose /></button>
                    </div>
                  )}

                  <div class="modal-footer">
                    <Button type="button" variant="flat" color='danger' data-bs-dismiss="modal">Cerrar</Button>
                    <Button type="submit" className='text-white' style={{ backgroundColor: '#0075a9' }}><AiOutlineSend />Enviar</Button>
                  </div>
                </form>


              </div>
            </div>
          </div>
        </div>
        <Table aria-label="Example static collection table" >
          <TableHeader>
            <TableColumn>Ver</TableColumn>
            <TableColumn>N° de Seguimiento</TableColumn>
            <TableColumn>Casa</TableColumn>
            <TableColumn>Nombre</TableColumn>
            <TableColumn>Asunto</TableColumn>
            <TableColumn>Estado</TableColumn>
            <TableColumn>Prioridad</TableColumn>
            <TableColumn>Sector</TableColumn>
            <TableColumn>Fecha de vencimiento</TableColumn>
          </TableHeader>
          <TableBody>
  {ticketsData &&
    ticketsData.map((ticket) => {
      // Verifica si el usuario es un cliente y si el ticket no debe ser visible para los clientes
      if (userData.cargo === 'cliente' && ticket.visible_cliente === 0) {
        // No renderiza la fila
        return null;
      }

      // Incrementa el contador total de tickets
      totalTickets++;

      // Filtra las filas según el valor de selectedOption
      if (selectedOption === 'Todos' || ticket.estado === selectedOption) {
        // Incrementa el contador según el estado del ticket
        if (ticket.estado === 'Abierto') {
          abiertoCount++;
        } else if (ticket.estado === 'Cerrado') {
          cerradoCount++;
        } else if (ticket.estado === 'En progreso') {
          enProgresoCount++;
        }

        return (
          <TableRow key={ticket.id}>
            <TableCell>
              <Tooltip content="Detalles">
                <span
                  className="text-lg text-default-400 cursor-pointer active:opacity-50"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal2"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <AiFillEye />
                </span>
              </Tooltip>
            </TableCell>
            <TableCell>{ticket.tracking_id}</TableCell>
            <TableCell>{ticket.nombre_casa}</TableCell>
            <TableCell>{ticket.nombre_creador}</TableCell>
            <TableCell>{ticket.asunto}</TableCell>
            <TableCell>{ticket.estado}</TableCell>
            <TableCell>{ticket.prioridad}</TableCell>
            <TableCell>{ticket.sector}</TableCell>
            <TableCell>
              {new Date(ticket.fecha_vencimiento)
                .toLocaleDateString()
                .split('-')
                .reverse()
                .join('-')}
            </TableCell>
          </TableRow>
        );
      }

      return null; // No renderiza filas que no coincidan con la opción seleccionada
    })}
</TableBody>


        </Table>
      </div>
      <div class="modal fade" id="exampleModal2" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">{selectedTicket?.tracking_id}</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><AiOutlineClose /></button>
            </div>
            <div class="modal-body">
              <div class="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div class="w-full">
                  <label for="casas" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <AiOutlineHome className="mr-1" /> Casa
                  </label>                  <input type="text" name="brand" disabled readonly id="disabled-input-2" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={selectedTicket?.nombre_casa} required="" />
                </div>
                <div class="w-full">
                  <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineInfoCircle className="mr-1" />Prioridad</label>
                  <input type="text" name="brand" disabled readonly id="disabled-input-2" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={selectedTicket?.prioridad} required="" />
                </div>
                <div className="w-full">
                  <label
                    htmlFor="estado"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"
                  >
                    <AiOutlineOrderedList className="mr-1" />
                    Estado
                  </label>
                  <select
                    name="estado"
                    id="estado"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={selectedEstado || selectedTicket?.estado || 'Abierto'} // Establece un valor predeterminado basado en selectedEstado y selectedTicket?.estado
                    onChange={handleEstadoChange}
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="Cerrado">Cerrado</option>
                    <option value="En progreso">En progreso</option>
                  </select>

                </div>
                <div class="w-full">
                  <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineApartment className="mr-1" />Sector</label>
                  <input type="text" name="brand" disabled readonly id="disabled-input-2" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={selectedTicket?.sector} required="" />
                </div>
                <div class="w-full">
                  <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineApartment className="mr-1" />Subsector</label>
                  <input type="text" name="brand" disabled readonly id="disabled-input-2" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={selectedTicket?.subsector} required="" />
                </div>
                <div class="w-full">
                  <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineMail className="mr-1" />Asunto</label>
                  <input type="text" name="brand" disabled readonly id="disabled-input-2" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" value={selectedTicket?.asunto} required="" />
                </div>
                <div class="sm:col-span-2">
                  <label for="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineForm className="mr-1" /> Descripción</label>
                  <textarea id="description" disabled readonly rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedTicket?.descripcion}></textarea>
                </div>
                <div class="w-full">
                  <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineCalendar className="mr-1" />Fecha de vencimiento</label>
                  <input
                    type="text"
                    name="brand"
                    disabled
                    readonly
                    id="disabled-input-2"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={selectedTicket?.fecha_vencimiento ? new Date(selectedTicket.fecha_vencimiento).toLocaleDateString().split('-').reverse().join('/') : ''}
                    required=""
                  />
                </div>
                <div class="w-full">
                  <label for="website" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineEye className="mr-1" />Visible para el cliente</label>
                  <input
                    type="text"
                    name="brand"
                    disabled
                    readonly
                    id="disabled-input-2"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={selectedTicket?.visible_cliente === 1 ? "Si" : "No"}
                    required=""
                  />

                </div>
                <div class="sm:col-span-2">
                  <label for="message" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"> <AiOutlineTeam className="mr-1" /> Derivado</label>
                  <input id="description" disabled readonly rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={selectedTicket?.derivado}/>
                </div>
                {selectedTicket?.archivos_adjuntos && (
                  <div class="sm:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineCamera className="mr-1" /> Foto</label>
                    <img class="h-auto max-w-xs rounded-lg" src={selectedTicket?.archivos_adjuntos} alt="image description" />
                  </div>
                )}
              </div>
            </div>

            <div class="modal-footer">



              <div class="w-full">

                <label for="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center"><AiOutlineMessage className="mr-1" />Comentarios</label>
                <ol class="relative border-l border-gray-200 dark:border-gray-700">
                  {comentariosArray.map((comentario, index) => (
                    <li key={index} class="mb-10 ml-4">
                      <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
                      <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{comentario.fecha}</time>
                      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{comentario.creador}</h3>
                      <p class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400">{comentario.Comentario}</p>
                    </li>
                  ))}
                </ol>
                <div class="relative">
                  <textarea
                    id="message"
                    rows="4"
                    value={comentario}
                    onChange={handleComentarioChange}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Escribe un comentario..."
                  ></textarea></div>
                  
              </div>


            </div>





            <div class="modal-footer">
              <Button type="button" variant="flat" color='danger' data-bs-dismiss="modal">Cerrar</Button>
              <Button
                type="button"
                className="text-white"
                style={{ backgroundColor: '#0075a9' }}
                onClick={async () => {
                  await handleUpdateTicket(); // Llama a la función actual para actualizar el ticket
                  await handleEnviarComentario(selectedTicket?.id); // Llama a la función para enviar comentarios con selectedTicket?.id como argumento
                }}
              >
              
                <AiOutlineUpload />
                Actualizar Ticket
              </Button>   
              <Button
                type="button"
                className="text-white"
                style={{ backgroundColor: "#d11919" }}
                onClick={exportToPDF}
              >
              
                <SiAdobeacrobatreader/>
                Exportar PDF
              </Button>  
                </div>
          </div>
        </div>
      </div>
      {
  /*
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
    </div>
  );
}

export default Tickets;
