# Guía de Despliegue y Mantenimiento en Producción (Ubuntu Server)

Esta guía contiene las especificaciones técnicas del entorno de producción, la configuración de la automatización CI/CD con GitHub Actions, y los comandos de administración necesarios para mantener la aplicación Jornades Esportives en funcionamiento en el servidor web.

---

## Índice
1. [Especificaciones del Servidor de Producción](#especificaciones-del-servidor-de-producción)
2. [Flujo de Despliegue Automatizado (CI/CD)](#flujo-de-despliegue-automatizado-cicd)
3. [Comandos de Mantenimiento y Logs en el Servidor](#comandos-de-mantenimiento-y-logs-en-el-servidor)
4. [Manual Conceptual de Configuración desde Cero](#manual-conceptual-de-configuración-desde-cero)

---

## Especificaciones del Servidor de Producción

La infraestructura de producción está configurada y asegurada con los siguientes parámetros:

* **Dirección IP Pública**: `46.224.3.226`
* **Usuario del Sistema**: `jornades`
* **Ruta de la Aplicación**: `/var/www/jornades`
* **Base de Datos**: PostgreSQL (`jornades_db` con el usuario `jornades_user` y el puerto interno `5432`)
* **Gestor de Procesos**: PM2 (Proceso con el nombre `"jornades-api"` escuchando en el puerto interno `3001`)
* **Servidor Web y Proxy**: Nginx (Escuchando en los puertos estándar `80` para HTTP y `443` para HTTPS seguro)
* **Seguridad y Cortafuegos**: Firewall UFW (Bloquea accesos directos externos a la DB y a la API)
* **Encriptación (SSL)**: Certificados seguros y gratuitos de Let's Encrypt (HTTPS activo)

---

## Flujo de Despliegue Automatizado (CI/CD)

El repositorio está configurado con GitHub Actions a través del archivo de flujo de trabajo [deploy.yml](file:///.github/workflows/deploy.yml).

### ¿Cómo funciona?
Cada vez que haces un `git push` a la rama `main`, GitHub inicia una máquina virtual que realiza los siguientes pasos de forma automática mediante SSH seguro en tu servidor Ubuntu:

1. **Descarga de Código**: Actualiza el código del servidor haciendo `git fetch` y `git reset --hard` contra la rama remota `main`.
2. **Backend**:
   * Instala las dependencias necesarias de producción (`npm install --production`).
   * Ejecuta nuevas migraciones de base de datos (`npm run db:migrate`).
   * Carga los datos de base de las jornadas si son requeridos (`npm run db:seed:minimal`).
3. **Frontend**:
   * Instala las dependencias y compila el frontend de React (`npm run build`), sobreescribiendo los ficheros estáticos en `/var/www/jornades/client/jornades/dist` que lee Nginx.
4. **Reinicio de Servicios**:
   * Indica a PM2 que reinicie el proceso `"jornades-api"` de forma segura para aplicar los cambios sin ninguna caída del servicio.

### Variables Secretas (GitHub Secrets)
Para que el flujo de trabajo funcione, asegúrate de tener configurados estos tres secretos en tu repositorio de GitHub (**Settings > Secrets and variables > Actions**):
* `REMOTE_HOST`: La IP pública del servidor (`46.224.3.226`).
* `REMOTE_USER`: El usuario SSH del servidor (`jornades`).
* `SSH_PRIVATE_KEY`: El contenido completo de tu clave privada de SSH (generada en el servidor en `~/.ssh/id_rsa`).

---

## Comandos de Mantenimiento y Logs en el Servidor

Cuando estés conectado al servidor Ubuntu por SSH, puedes utilizar los siguientes comandos para monitorizar y depurar la aplicación:

### Gestión del Backend (PM2)
* **Ver estado general de las apps**: `pm2 status`
* **Ver logs del backend en tiempo real (consola de Express)**: `pm2 logs jornades-api`
* **Reiniciar el backend manualmente**: `pm2 restart jornades-api`
* **Parar el backend manualmente**: `pm2 stop jornades-api`

### Gestión del Servidor Web (Nginx)
* **Comprobar errores de sintaxis en Nginx**: `sudo nginx -t`
* **Reiniciar Nginx**: `sudo systemctl restart nginx`
* **Ver logs de accesos a la web**: `sudo tail -f /var/log/nginx/access.log`
* **Ver logs de errores de Nginx**: `sudo tail -f /var/log/nginx/error.log`

### Gestión de la Base de Datos (PostgreSQL)
* **Ver el estado del servicio PostgreSQL**: `sudo systemctl status postgresql`
* **Reiniciar base de datos**: `sudo systemctl restart postgresql`
* **Acceder a la consola interactiva de Postgres**: `sudo -u postgres psql`

### Gestión del SSL (Certbot)
* **Verificar el estado y la auto-renovación de certificados**: `sudo certbot renew --dry-run`

---

## Manual Conceptual de Configuración desde Cero

Si necesitas replicar la configuración de producción en una máquina o servidor Ubuntu Server vacío, sigue estos pasos conceptuales en orden:

1. **Actualizar el Servidor**: Actualizar la lista de paquetes del sistema operativo Ubuntu.
2. **Configurar UFW (Firewall)**: Instalar y habilitar el cortafuegos, permitiendo los puertos de SSH y los accesos públicos de Nginx (Nginx Full).
3. **Instalar Git**: Necesario para poder clonar y actualizar el repositorio en el servidor.
4. **Instalar Node.js v22 y NPM**: Entorno necesario para correr Express y construir el bundle de React.
5. **Instalar PM2**: El gestor que mantendrá el backend vivo en segundo plano.
6. **Instalar PostgreSQL**: El motor de base de datos relacional para los torneos y usuarios.
7. **Configurar Credenciales SQL**: Crear la base de datos `jornades_db` y un usuario con permisos.
8. **Instalar Nginx**: Servidor web principal que actúa como proxy reverso para desviar tráfico al backend y websockets.
9. **Configurar Nginx Site**: Crear el archivo de configuración del sitio mapeando la carpeta `dist` en la raíz y redirigiendo `/api` y `/socket.io` al puerto `3001` local.
10. **Instalar Certbot (SSL)**: Solicitar y configurar los certificados seguros HTTPS de Let's Encrypt para proteger los datos de sesión y de Google de forma automática y renovable.
