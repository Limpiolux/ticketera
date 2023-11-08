# Usar una imagen base de Node.js con la versión LTS
FROM node:14

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar el archivo package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Cambiar los permisos de los archivos y directorios
RUN chmod -R 755 .

# Construir la aplicación React
RUN npm run build

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Comando para servir la aplicación React (usando serve)
CMD ["npx", "serve", "-s", "build"]
