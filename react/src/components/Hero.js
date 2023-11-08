import React, { useState, useEffect } from 'react';

function Hero() {
    const [marginTop, setMarginTop] = useState('0');

  useEffect(() => {
    // Función para verificar el tamaño de la pantalla y establecer el margen superior
    function checkScreenSize() {
      if (window.innerWidth > 1024) {
        setMarginTop('-120px');
      } else {
        setMarginTop('0');
      }
    }

    // Verificar el tamaño de la pantalla al cargar y al cambiar el tamaño de la ventana
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Eliminar el evento del oyente al desmontar el componente
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
    return (
      <>
    <section class="bg-white dark:bg-gray-900" style={{ marginTop }}>
        <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
            <div class="max-w-screen-md mb-8 lg:mb-16 mx-auto text-center">
                <h2 class="mb-4 text-4xl tracking-tight font-medium text-gray-900 dark:text-white">Diseñado para equipos de negocios como el tuyo.</h2>
                <p class="text-gray-500 sm:text-xl dark:text-gray-400">Here at Flowbite we focus on markets where technology, innovation, and capital can unlock long-term value and drive economic growth.</p>
            </div>

            <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
                <div>
                    <h3 class="mb-2 text-xl font-bold dark:text-white">Marketing</h3>
                    <p class="text-gray-500 dark:text-gray-400">Plan it, create it, launch it. Collaborate seamlessly with all  the organization and hit your marketing goals every month with our marketing plan.</p>
                </div>
                <div>
                    <h3 class="mb-2 text-xl font-bold dark:text-white">Legal</h3>
                    <p class="text-gray-500 dark:text-gray-400">Protect your organization, devices and stay compliant with our structured workflows and custom permissions made for you.</p>
                </div>
                <div>
                    <h3 class="mb-2 text-xl font-bold dark:text-white">Business Automation</h3>
                    <p class="text-gray-500 dark:text-gray-400">Auto-assign tasks, send Slack messages, and much more. Now power up with hundreds of new templates to help you get started.</p>
                </div>
            </div>
        </div>
    </section>

    </>
    );
}

export default Hero;
