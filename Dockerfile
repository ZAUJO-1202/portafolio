# Usamos una imagen ligera de Nginx
FROM nginx:stable-alpine

# Copiamos el contenido de nuestra carpeta actual al directorio que Nginx usa para servir archivos
COPY . /usr/share/nginx/html

# Exponemos el puerto 80
EXPOSE 80

# Nginx se ejecuta automáticamente al iniciar el contenedor