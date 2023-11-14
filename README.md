
# Ticketera

[Ticketera Servicios](https://servicios.grupolimpiolux.com.ar/)	de Limpiolux es una aplicación para subir y gestionar tickets de los distintos clientes y casas que tiene esta empresa. En la aplicación podras loguearte con una cuenta registrada en la base de datos, despues de loguearte podras crear y ver tickets, tambien podras realizar comentarios dentro de estos. Los usuarios tienen la posibilidad de exportar esos tickets en Excel o PDF.

## Tecnologías Usadas

|Front End   | Back End  | 
|---|---|
| React  | Nodejs  |
| Tailwind  | Express  |  
| Bootstrap  | MySQL  |   
| NextUI  | SQL Server  |   
| Tremor  | Postman  |   
| React Icons  | Docker  |   

## Instalación

Este repositorio es para un instalar la aplicación en un ambiente de producción.

1.  Primero tendras que mover estos archivos al servidor. Para ello lo podes hacer con Git usando este comando: 

~~~
git clone https://github.com/Limpiolux/ticketera.git
~~~

2. El siguiente paso sería mover todos los archivos al servidor y ejecutar comandos de Docker.

~~~
docker-compose up --build
~~~

Despues todas las configuraciones siguientes las hizo mi compañero Ernesto. 

Para usar este código en un ambiente de desarrollo use [XAMPP](https://www.apachefriends.org/es/index.html)

## Endpoints de API

La aplicación funciona con Endpoints para enviar y recibir información en formato JSON con metodos GET, POST y PUT.

Algunos de estos Endpoints son:

1. Register (POST)
~~~
https://servicios.grupolimpiolux.com.ar:3001/api/register
~~~
2. Login (POST)
~~~
https://servicios.grupolimpiolux.com.ar:3001/api/login
~~~
3. Cambio de Contraseña (PUT)
~~~
https://servicios.grupolimpiolux.com.ar:3001/api/changepassword/:id
~~~

## Screenshots
![Login](https://i.ibb.co/yk4MdXR/Screen-Shot-Tool-20231108122448.png)

![Dashboard](https://i.ibb.co/qDFr6hH/Screen-Shot-Tool-20231108122731.png)

![Gráficos](https://i.ibb.co/dpFprd1/Screen-Shot-Tool-20231108122822.png)



