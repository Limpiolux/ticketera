import React, { useState } from 'react';

function Home() {
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
      <main className="w-full h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-gray-600">
          <div className="text-center">
            <img src="limpiolux-icon.svg" width={150} className="mx-auto" />
            <div className="mt-5 space-y-2">
              <h3 className="text-gray-800 text-2xl font-bold sm:text-3xl">Entrá en tu cuenta</h3>
              <p className="">¿No tienes cuenta todavía? <a href="mailto:sistemas@limpiolux.com.ar" className="font-medium text-blue-700 hover:text-blue-500	">Escribenos</a></p>
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="font-medium">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>
            <div>
              <label className="font-medium">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
              />
            </div>
            <button
              type="submit"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 w-100"
              style={{ textDecoration: 'none', backgroundColor: '#0075a9' }}
            >
              Sign in
            </button>
            <div className="text-center">
              <a href="mailto:sistemas@limpiolux.com.ar" className="hover:text-blue-500">Forgot password?</a>
            </div>
          </form>
          
          {showErrorMessage && (
            <div className="mt-4 text-red-500">
              No se pudo iniciar sesión. Verifica tu email y contraseña.
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default Home;
