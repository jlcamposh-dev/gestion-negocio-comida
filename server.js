const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Archivo de base de datos
const DB_FILE = path.join(__dirname, 'database.json');

// Inicializar base de datos
async function initDatabase() {
    try {
        await fs.access(DB_FILE);
    } catch {
        const initialData = {
            ventas: [],
            gastos: [],
            menuComidaCorrida: {}
        };
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Leer base de datos
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        const parsed = JSON.parse(data);
        // Asegurar que menuComidaCorrida existe
        if (!parsed.menuComidaCorrida) {
            parsed.menuComidaCorrida = {};
        }
        return parsed;
    } catch (error) {
        console.error('Error leyendo base de datos:', error);
        return { ventas: [], gastos: [], menuComidaCorrida: {} };
    }
}

// Escribir base de datos
async function writeDatabase(data) {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error escribiendo base de datos:', error);
        return false;
    }
}

// Rutas - Ventas
app.get('/api/ventas', async (req, res) => {
    const db = await readDatabase();
    res.json(db.ventas);
});

app.post('/api/ventas', async (req, res) => {
    const db = await readDatabase();
    const nuevaVenta = {
        id: Date.now(),
        ...req.body,
        fechaRegistro: new Date().toISOString()
    };
    db.ventas.push(nuevaVenta);
    
    if (await writeDatabase(db)) {
        res.json({ success: true, venta: nuevaVenta });
    } else {
        res.status(500).json({ success: false, error: 'Error guardando venta' });
    }
});

app.delete('/api/ventas/:id', async (req, res) => {
    const db = await readDatabase();
    const id = parseInt(req.params.id);
    db.ventas = db.ventas.filter(v => v.id !== id);
    
    if (await writeDatabase(db)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Error eliminando venta' });
    }
});

// Rutas - Gastos
app.get('/api/gastos', async (req, res) => {
    const db = await readDatabase();
    res.json(db.gastos);
});

app.post('/api/gastos', async (req, res) => {
    const db = await readDatabase();
    const nuevoGasto = {
        id: Date.now(),
        ...req.body,
        fechaRegistro: new Date().toISOString()
    };
    db.gastos.push(nuevoGasto);
    
    if (await writeDatabase(db)) {
        res.json({ success: true, gasto: nuevoGasto });
    } else {
        res.status(500).json({ success: false, error: 'Error guardando gasto' });
    }
});

app.delete('/api/gastos/:id', async (req, res) => {
    const db = await readDatabase();
    const id = parseInt(req.params.id);
    db.gastos = db.gastos.filter(g => g.id !== id);
    
    if (await writeDatabase(db)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, error: 'Error eliminando gasto' });
    }
});

// Ruta para estadísticas
app.get('/api/estadisticas', async (req, res) => {
    const db = await readDatabase();
    const totalVentas = db.ventas.reduce((sum, v) => sum + v.monto, 0);
    const totalGastos = db.gastos.reduce((sum, g) => sum + g.monto, 0);
    
    res.json({
        totalVentas,
        totalGastos,
        gananciaNeta: totalVentas - totalGastos,
        totalPedidos: db.ventas.length,
        totalTransacciones: db.ventas.length + db.gastos.length
    });
});

// Rutas para Menú de Comida Corrida
app.get('/api/menu', async (req, res) => {
    const db = await readDatabase();
    res.json(db.menuComidaCorrida || {});
});

app.post('/api/menu', async (req, res) => {
    try {
        const db = await readDatabase();
        const { dia, tiempo, opcion, nombre, descripcion } = req.body;
        
        // Validar datos
        if (!dia || !tiempo || !opcion || !nombre) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan datos requeridos' 
            });
        }
        
        // Inicializar estructura si no existe
        if (!db.menuComidaCorrida[dia]) {
            db.menuComidaCorrida[dia] = {
                'Sopa': {},
                'Plato Fuerte': {},
                'Postre': {}
            };
        }
        
        // Guardar platillo
        db.menuComidaCorrida[dia][tiempo][opcion] = {
            nombre: nombre,
            descripcion: descripcion || ''
        };
        
        if (await writeDatabase(db)) {
            res.json({ 
                success: true, 
                platillo: { nombre, descripcion, dia, tiempo, opcion } 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Error guardando platillo' 
            });
        }
    } catch (error) {
        console.error('Error en POST /api/menu:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error del servidor' 
        });
    }
});

app.delete('/api/menu/:dia/:tiempo/:opcion', async (req, res) => {
    try {
        const db = await readDatabase();
        const { dia, tiempo, opcion } = req.params;
        
        if (db.menuComidaCorrida[dia]?.[tiempo]?.[opcion]) {
            delete db.menuComidaCorrida[dia][tiempo][opcion];
            
            if (await writeDatabase(db)) {
                res.json({ success: true });
            } else {
                res.status(500).json({ 
                    success: false, 
                    error: 'Error eliminando platillo' 
                });
            }
        } else {
            res.status(404).json({ 
                success: false, 
                error: 'Platillo no encontrado' 
            });
        }
    } catch (error) {
        console.error('Error en DELETE /api/menu:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error del servidor' 
        });
    }
});

// Ruta para descargar respaldo
app.get('/api/backup', async (req, res) => {
    try {
        const db = await readDatabase();
        const fecha = new Date().toISOString().split('T')[0];
        const filename = `backup-negocio-${fecha}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(db);
    } catch (error) {
        console.error('Error creando backup:', error);
        res.status(500).json({ success: false, error: 'Error creando backup' });
    }
});

// Ruta para restaurar respaldo
app.post('/api/restore', async (req, res) => {
    try {
        const data = req.body;
        
        // Validar que tenga la estructura correcta
        if (!data.ventas || !data.gastos) {
            return res.status(400).json({ 
                success: false, 
                error: 'Formato de respaldo inválido' 
            });
        }
        
        // Asegurar que menuComidaCorrida existe
        if (!data.menuComidaCorrida) {
            data.menuComidaCorrida = {};
        }
        
        if (await writeDatabase(data)) {
            res.json({ success: true, message: 'Datos restaurados exitosamente' });
        } else {
            res.status(500).json({ success: false, error: 'Error restaurando datos' });
        }
    } catch (error) {
        console.error('Error restaurando backup:', error);
        res.status(500).json({ success: false, error: 'Error restaurando datos' });
    }
});

// Iniciar servidor
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Base de datos: ${DB_FILE}`);
    });
});
