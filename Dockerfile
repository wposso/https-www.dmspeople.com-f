# Imagen base de Nginx
FROM nginx:alpine

# Elimina la configuración por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos del proyecto
COPY . /usr/share/nginx/html

# Copia una configuración de Nginx personalizada (la haremos abajo)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto (Railway lo ignora, pero lo dejamos por claridad)
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
