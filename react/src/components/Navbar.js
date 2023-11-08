import React, { useState } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import "flowbite/dist/flowbite.min.css";
import { Button } from "@nextui-org/react";
import { AiOutlineLogin, AiOutlineClose, AiOutlineMail, AiOutlineKey } from "react-icons/ai";

function Navbar() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showErrorMessage, setShowErrorMessage] = useState(false); // Variable de estado para mostrar el mensaje de error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('https://servicios.grupolimpiolux.com.ar:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      if (response.status === 200) {
        const data = await response.json();
        const { token, user } = data;
  
        // Guarda el token y los datos del usuario en el almacenamiento local
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
  
        // Redirige al usuario a la página de inicio
        window.location.href = '/inicio';
      } else {
        // El usuario no se encontró o la contraseña es incorrecta, muestra el mensaje de error
        setShowErrorMessage(true);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="/" class="flex items-center">
            <img src="limpiolux-icon.svg" class="h-8 mr-3" alt="Flowbite Logo" />
          </a>
          <div class="flex md:order-2">

            <Button type="button" className='text-white' clas data-bs-toggle="modal" data-bs-target="#authentication-modal" style={{ backgroundColor: '#0075a9' }}>
              <AiOutlineLogin /> Entrar
            </Button>
          </div>
        </div>
      </nav>
      <div class="modal fade" id="authentication-modal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">Entra a nuestra plataforma</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><AiOutlineClose /></button>
            </div>
            <div class="modal-body">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div class="mb-3">
                <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
  <AiOutlineMail className="mr-1" /> Email
</label>                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    class="form-control bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="ejemplo@limpiolux.com.ar"
                    required
                  />
                </div>
                <div class="mb-3">
                <label for="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
  <AiOutlineKey className="mr-1" /> Contraseña
</label>                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    class="form-control bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>
                  {showErrorMessage && (
                  <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
  <span class="font-medium">¡Usuario no encontrado!</span> Verifica si los datos ingresados son correctos.
</div>                )}
                <div class="text-center">
                  <a href="#" class="text-primary" style={{ textDecoration: 'none', Color: '#0075a9' }}>¿Olvidaste la contraseña?</a>
                </div>
              
                <Button
                  type="submit"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 w-100"
                  style={{ textDecoration: 'none', backgroundColor: '#0075a9' }}
                >
                  Loguea con tu cuenta
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
