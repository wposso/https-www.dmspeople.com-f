# Imagen base liviana de Nginx
FROM nginx:alpine

# Elimina la configuración por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia todos tus archivos del proyecto al contenedor
COPY . /usr/share/nginx/html

# Expone el puerto 80 (Railway lo maneja automáticamente)
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
