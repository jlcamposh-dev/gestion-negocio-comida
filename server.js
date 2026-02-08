const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Archivo de base de datos
const DB_FILE = path.join(__dirname, 'database.json');

// Inicializar base de datos
async function initDatabase() {
    try {
        await fs.access(DB_FILE);
    } catch {
        const initialData = {
            ventas: [],
            gastos: []
        };
        await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Leer base de datos
async function readDatabase() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo base de datos:', error);
        return { ventas: [], gastos: [] };
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

// Iniciar servidor
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📊 Base de datos: ${DB_FILE}`);
    });
});
