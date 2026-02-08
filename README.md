# Sistema de Gestión para Negocio de Comida a Domicilio

Sistema completo para administrar ventas y gastos de tu negocio de comida a domicilio con base de datos compartida.

## 🚀 Características

- ✅ Registro de ventas con cliente, producto, método de pago
- ✅ Registro de gastos por categorías
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Reportes y análisis por períodos
- ✅ Base de datos compartida (todos ven la misma información)
- ✅ Interfaz responsive para móvil y escritorio

## 📋 Requisitos

- Node.js 14 o superior
- npm (incluido con Node.js)

## 🔧 Instalación Local

1. **Descarga los archivos** del proyecto

2. **Instala las dependencias**:
```bash
npm install
```

3. **Inicia el servidor**:
```bash
npm start
```

4. **Abre tu navegador** en:
```
http://localhost:3000
```

## 🌐 Desplegar en un Servidor

### Opción 1: Servidor VPS (Recomendado)

#### En DigitalOcean, AWS, Linode, etc:

1. **Conecta a tu servidor por SSH**:
```bash
ssh usuario@tu-servidor.com
```

2. **Instala Node.js** (si no lo tienes):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Sube los archivos** del proyecto a tu servidor (puedes usar SCP, SFTP o Git)

4. **Instala las dependencias**:
```bash
cd /ruta/de/tu/proyecto
npm install
```

5. **Instala PM2** para mantener el servidor corriendo:
```bash
sudo npm install -g pm2
```

6. **Inicia la aplicación con PM2**:
```bash
pm2 start server.js --name "gestion-negocio"
pm2 save
pm2 startup
```

7. **Configura un dominio** (opcional):
   - Usa Nginx o Apache como proxy reverso
   - Configura SSL con Let's Encrypt

### Opción 2: Heroku (Gratuito/Fácil)

1. **Crea cuenta** en [Heroku](https://heroku.com)

2. **Instala Heroku CLI**:
```bash
npm install -g heroku
```

3. **Inicia sesión**:
```bash
heroku login
```

4. **Crea la aplicación**:
```bash
heroku create nombre-tu-negocio
```

5. **Sube el código**:
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

6. **Tu app estará en**: `https://nombre-tu-negocio.herokuapp.com`

### Opción 3: Railway (Gratuito/Moderno)

1. **Crea cuenta** en [Railway.app](https://railway.app)

2. **Conecta tu repositorio** de GitHub o sube el código

3. **Railway detectará automáticamente** que es un proyecto Node.js

4. **Tu app estará lista** con una URL pública

### Opción 4: Render (Gratuito)

1. **Crea cuenta** en [Render.com](https://render.com)

2. **Nuevo Web Service** → Conecta repositorio o sube código

3. **Configuración**:
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Deploy** automático

## 📱 Acceso desde Múltiples Dispositivos

Una vez desplegado, cualquier persona con acceso a la URL podrá:
- Registrar ventas y gastos
- Ver el dashboard actualizado
- Consultar reportes
- Todos verán la misma información en tiempo real

## 🔒 Seguridad (Importante)

**⚠️ ESTE SISTEMA NO TIENE AUTENTICACIÓN**

Para agregar seguridad básica:

1. **Agrega autenticación** con usuario y contraseña
2. **Usa HTTPS** (SSL/TLS)
3. **Restringe el acceso** por IP si es necesario
4. **Crea backups** regulares de `database.json`

## 💾 Respaldo de Datos

Tu base de datos se guarda en `database.json`. Para hacer backup:

```bash
# Copiar manualmente
cp database.json database.backup.json

# O programar backups automáticos con cron
0 0 * * * cp /ruta/database.json /ruta/backups/database-$(date +\%Y\%m\%d).json
```

## 🛠 Estructura de Archivos

```
proyecto/
├── server.js           # Servidor Node.js
├── package.json        # Dependencias
├── database.json       # Base de datos (se crea automáticamente)
├── public/
│   └── index.html      # Interfaz web
└── README.md           # Esta documentación
```

## 🆘 Solución de Problemas

**El servidor no inicia:**
- Verifica que Node.js esté instalado: `node --version`
- Revisa que el puerto 3000 esté libre

**No se guardan los datos:**
- Verifica permisos de escritura en la carpeta
- Revisa el archivo `database.json`

**No puedo acceder desde otro dispositivo:**
- Verifica que el firewall permita conexiones al puerto 3000
- Usa la IP pública del servidor, no `localhost`

## 📞 Soporte

Para agregar más funcionalidades o modificar el sistema, puedes editar:
- `server.js` - Lógica del servidor
- `public/index.html` - Interfaz de usuario

## 📄 Licencia

Libre para uso personal y comercial.
