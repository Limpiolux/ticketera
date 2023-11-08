# Usamos la imagen oficial de Node.js
FROM node:18

# Establecemos el directorio de trabajo en /app
WORKDIR /app

# Copiamos el archivo package.json y package-lock.json primero
COPY package.json package-lock.json /app/
COPY app.js /app/

# Ejecutamos npm install para instalar las dependencias
RUN npm install

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
