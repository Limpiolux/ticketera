# Usa una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia los archivos de tu aplicación a la imagen de Docker
COPY package.json package-lock.json /app/
COPY app.js /app/
COPY grupolimpiolux.key /app/
COPY grupolimpiolux.crt /app/

# Instala las dependencias de la aplicación
RUN npm install

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Comando para iniciar la aplicación cuando se ejecute el contenedor
CMD ["node", "app.js"]
