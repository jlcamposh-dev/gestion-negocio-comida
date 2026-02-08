# 🚀 GUÍA RÁPIDA DE INSTALACIÓN

## Para empezar AHORA (en tu computadora):

1. **Descarga e instala Node.js**:
   - Ve a: https://nodejs.org
   - Descarga la versión "LTS" (recomendada)
   - Instala con todas las opciones por defecto

2. **Abre una terminal/consola**:
   - Windows: Presiona `Win + R`, escribe `cmd` y Enter
   - Mac: Abre "Terminal" desde Spotlight
   - Linux: Ctrl + Alt + T

3. **Navega a la carpeta del proyecto**:
   ```
   cd ruta/donde/guardaste/los/archivos
   ```

4. **Instala las dependencias**:
   ```
   npm install
   ```

5. **Inicia el servidor**:
   ```
   npm start
   ```

6. **¡Listo!** Abre tu navegador en:
   ```
   http://localhost:3000
   ```

---

## Para poner EN LÍNEA (que otros accedan):

### 🌟 OPCIÓN MÁS FÁCIL: Railway.app

1. Ve a https://railway.app
2. Crea una cuenta (gratis)
3. Click en "New Project" → "Deploy from GitHub"
4. Sube estos archivos a GitHub primero, o usa "Deploy from CLI"
5. Railway detectará automáticamente tu proyecto Node.js
6. ¡En 2 minutos tendrás una URL pública!

**Ejemplo**: `https://tu-negocio.up.railway.app`

### 💰 OPCIÓN GRATUITA: Render.com

1. Ve a https://render.com
2. Crea cuenta gratis
3. "New Web Service"
4. Conecta con GitHub o sube directamente
5. Build Command: `npm install`
6. Start Command: `npm start`
7. ¡Deploy!

### 🔧 OPCIÓN CON TU PROPIO SERVIDOR:

Si tienes un servidor VPS o hosting con Node.js:

1. Sube los archivos por FTP/SFTP
2. Conéctate por SSH
3. Ejecuta:
   ```bash
   cd /ruta/del/proyecto
   npm install
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

---

## 📱 Acceso desde celular u otras computadoras:

Una vez en línea, comparte la URL con tu equipo:
- `https://tu-dominio.com`

Todos podrán:
- ✅ Ver las mismas ventas
- ✅ Registrar gastos
- ✅ Consultar reportes
- ✅ Todo actualizado en tiempo real

---

## ⚠️ IMPORTANTE - Seguridad

Este sistema NO tiene contraseña. Cualquiera con la URL puede acceder.

Para protegerlo:
1. No compartas la URL públicamente
2. Solo dásela a tu equipo de confianza
3. Considera agregar autenticación después

---

## 🆘 ¿Problemas?

**"npm no se reconoce como comando"**
→ Reinstala Node.js y reinicia la terminal

**"El puerto 3000 ya está en uso"**
→ Cambia en server.js: `const PORT = 3001;`

**"No puedo acceder desde otro dispositivo"**
→ Necesitas desplegarlo en línea (Railway, Render, etc.)

---

## 📞 Siguiente Paso

1. Prueba localmente primero
2. Cuando funcione bien, despliega en Railway o Render
3. Comparte la URL con tu equipo
4. ¡A trabajar!
