# Imagen base Nginx
FROM nginx:alpine

# Instalar envsubst (para sustituir variables en el arranque)
RUN apk add --no-cache gettext

# Elimina archivos por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos del sitio
COPY . /usr/share/nginx/html

# Copia la plantilla de configuración (ver más abajo)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expone el puerto (Railway lo ignora, pero es buena práctica)
EXPOSE 80

# Sustituye $PORT al iniciar y lanza Nginx
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
