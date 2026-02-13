const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/menu-comida-corrida.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu-comida-corrida.html'));
});

// Configuración de PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Inicializar base de datos
async function initDatabase() {
    const client = await pool.connect();
    try {
        // Tabla de ventas
        await client.query(`
            CREATE TABLE IF NOT EXISTS ventas (
                id SERIAL PRIMARY KEY,
                fecha DATE NOT NULL,
                cliente VARCHAR(255) NOT NULL,
                producto TEXT NOT NULL,
                monto DECIMAL(10, 2) NOT NULL,
                metodo_pago VARCHAR(50) NOT NULL,
                notas TEXT,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de gastos
        await client.query(`
            CREATE TABLE IF NOT EXISTS gastos (
                id SERIAL PRIMARY KEY,
                fecha DATE NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                descripcion TEXT NOT NULL,
                monto DECIMAL(10, 2) NOT NULL,
                proveedor VARCHAR(255),
                notas TEXT,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de menú de comida corrida
        await client.query(`
            CREATE TABLE IF NOT EXISTS menu_comida_corrida (
                id SERIAL PRIMARY KEY,
                dia VARCHAR(20) NOT NULL,
                tiempo VARCHAR(50) NOT NULL,
                opcion INTEGER NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                UNIQUE(dia, tiempo, opcion)
            )
        `);

        console.log('✅ Tablas de base de datos inicializadas');
    } catch (error) {
        console.error('Error inicializando base de datos:', error);
    } finally {
        client.release();
    }
}

// ==================== RUTAS DE VENTAS ====================

app.get('/api/ventas', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ventas ORDER BY fecha DESC, id DESC'
        );
        
        // Convertir a formato compatible con el frontend
        const ventas = result.rows.map(row => ({
            id: row.id,
            fecha: row.fecha.toISOString().split('T')[0],
            cliente: row.cliente,
            producto: row.producto,
            monto: parseFloat(row.monto),
            metodoPago: row.metodo_pago,
            notas: row.notas
        }));
        
        res.json(ventas);
    } catch (error) {
        console.error('Error obteniendo ventas:', error);
        res.status(500).json({ success: false, error: 'Error obteniendo ventas' });
    }
});

app.post('/api/ventas', async (req, res) => {
    try {
        const { fecha, cliente, producto, monto, metodoPago, notas } = req.body;
        
        const result = await pool.query(
            `INSERT INTO ventas (fecha, cliente, producto, monto, metodo_pago, notas) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [fecha, cliente, producto, monto, metodoPago, notas || '']
        );
        
        const venta = {
            id: result.rows[0].id,
            fecha: result.rows[0].fecha.toISOString().split('T')[0],
            cliente: result.rows[0].cliente,
            producto: result.rows[0].producto,
            monto: parseFloat(result.rows[0].monto),
            metodoPago: result.rows[0].metodo_pago,
            notas: result.rows[0].notas
        };
        
        res.json({ success: true, venta });
    } catch (error) {
        console.error('Error guardando venta:', error);
        res.status(500).json({ success: false, error: 'Error guardando venta' });
    }
});

app.delete('/api/ventas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM ventas WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error eliminando venta:', error);
        res.status(500).json({ success: false, error: 'Error eliminando venta' });
    }
});

// ==================== RUTAS DE GASTOS ====================

app.get('/api/gastos', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM gastos ORDER BY fecha DESC, id DESC'
        );
        
        const gastos = result.rows.map(row => ({
            id: row.id,
            fecha: row.fecha.toISOString().split('T')[0],
            categoria: row.categoria,
            descripcion: row.descripcion,
            monto: parseFloat(row.monto),
            proveedor: row.proveedor,
            notas: row.notas
        }));
        
        res.json(gastos);
    } catch (error) {
        console.error('Error obteniendo gastos:', error);
        res.status(500).json({ success: false, error: 'Error obteniendo gastos' });
    }
});

app.post('/api/gastos', async (req, res) => {
    try {
        const { fecha, categoria, descripcion, monto, proveedor, notas } = req.body;
        
        const result = await pool.query(
            `INSERT INTO gastos (fecha, categoria, descripcion, monto, proveedor, notas) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [fecha, categoria, descripcion, monto, proveedor || '', notas || '']
        );
        
        const gasto = {
            id: result.rows[0].id,
            fecha: result.rows[0].fecha.toISOString().split('T')[0],
            categoria: result.rows[0].categoria,
            descripcion: result.rows[0].descripcion,
            monto: parseFloat(result.rows[0].monto),
            proveedor: result.rows[0].proveedor,
            notas: result.rows[0].notas
        };
        
        res.json({ success: true, gasto });
    } catch (error) {
        console.error('Error guardando gasto:', error);
        res.status(500).json({ success: false, error: 'Error guardando gasto' });
    }
});

app.delete('/api/gastos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM gastos WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error eliminando gasto:', error);
        res.status(500).json({ success: false, error: 'Error eliminando gasto' });
    }
});

// ==================== RUTAS DE ESTADÍSTICAS ====================

app.get('/api/estadisticas', async (req, res) => {
    try {
        const ventasResult = await pool.query('SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as count FROM ventas');
        const gastosResult = await pool.query('SELECT COALESCE(SUM(monto), 0) as total FROM gastos');
        
        const totalVentas = parseFloat(ventasResult.rows[0].total);
        const totalGastos = parseFloat(gastosResult.rows[0].total);
        const totalPedidos = parseInt(ventasResult.rows[0].count);
        
        res.json({
            totalVentas,
            totalGastos,
            gananciaNeta: totalVentas - totalGastos,
            totalPedidos,
            totalTransacciones: totalPedidos
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ success: false, error: 'Error obteniendo estadísticas' });
    }
});

// ==================== RUTAS DE MENÚ ====================

app.get('/api/menu', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM menu_comida_corrida ORDER BY dia, tiempo, opcion');
        
        // Convertir a formato del frontend
        const menu = {};
        result.rows.forEach(row => {
            if (!menu[row.dia]) {
                menu[row.dia] = {
                    'Sopa': {},
                    'Plato Fuerte': {},
                    'Postre': {}
                };
            }
            menu[row.dia][row.tiempo][row.opcion] = {
                nombre: row.nombre,
                descripcion: row.descripcion
            };
        });
        
        res.json(menu);
    } catch (error) {
        console.error('Error obteniendo menú:', error);
        res.status(500).json({ success: false, error: 'Error obteniendo menú' });
    }
});

app.post('/api/menu', async (req, res) => {
    try {
        const { dia, tiempo, opcion, nombre, descripcion } = req.body;
        
        if (!dia || !tiempo || !opcion || !nombre) {
            return res.status(400).json({ 
                success: false, 
                error: 'Faltan datos requeridos' 
            });
        }
        
        // Usar UPSERT para actualizar si existe o insertar si no
        await pool.query(
            `INSERT INTO menu_comida_corrida (dia, tiempo, opcion, nombre, descripcion)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (dia, tiempo, opcion) 
             DO UPDATE SET nombre = $4, descripcion = $5`,
            [dia, tiempo, parseInt(opcion), nombre, descripcion || '']
        );
        
        res.json({ 
            success: true, 
            platillo: { nombre, descripcion, dia, tiempo, opcion } 
        });
    } catch (error) {
        console.error('Error guardando platillo:', error);
        res.status(500).json({ success: false, error: 'Error guardando platillo' });
    }
});

app.delete('/api/menu/:dia/:tiempo/:opcion', async (req, res) => {
    try {
        const { dia, tiempo, opcion } = req.params;
        
        await pool.query(
            'DELETE FROM menu_comida_corrida WHERE dia = $1 AND tiempo = $2 AND opcion = $3',
            [dia, tiempo, parseInt(opcion)]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error eliminando platillo:', error);
        res.status(500).json({ success: false, error: 'Error eliminando platillo' });
    }
});

// ==================== RUTAS DE BACKUP ====================

app.get('/api/backup', async (req, res) => {
    try {
        const ventasResult = await pool.query('SELECT * FROM ventas ORDER BY id');
        const gastosResult = await pool.query('SELECT * FROM gastos ORDER BY id');
        const menuResult = await pool.query('SELECT * FROM menu_comida_corrida ORDER BY id');
        
        // Convertir ventas
        const ventas = ventasResult.rows.map(row => ({
            id: row.id,
            fecha: row.fecha.toISOString().split('T')[0],
            cliente: row.cliente,
            producto: row.producto,
            monto: parseFloat(row.monto),
            metodoPago: row.metodo_pago,
            notas: row.notas
        }));
        
        // Convertir gastos
        const gastos = gastosResult.rows.map(row => ({
            id: row.id,
            fecha: row.fecha.toISOString().split('T')[0],
            categoria: row.categoria,
            descripcion: row.descripcion,
            monto: parseFloat(row.monto),
            proveedor: row.proveedor,
            notas: row.notas
        }));
        
        // Convertir menú
        const menuComidaCorrida = {};
        menuResult.rows.forEach(row => {
            if (!menuComidaCorrida[row.dia]) {
                menuComidaCorrida[row.dia] = {
                    'Sopa': {},
                    'Plato Fuerte': {},
                    'Postre': {}
                };
            }
            menuComidaCorrida[row.dia][row.tiempo][row.opcion] = {
                nombre: row.nombre,
                descripcion: row.descripcion
            };
        });
        
        const backup = {
            ventas,
            gastos,
            menuComidaCorrida,
            fecha_backup: new Date().toISOString()
        };
        
        const fecha = new Date().toISOString().split('T')[0];
        const filename = `backup-negocio-${fecha}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.json(backup);
    } catch (error) {
        console.error('Error creando backup:', error);
        res.status(500).json({ success: false, error: 'Error creando backup' });
    }
});

app.post('/api/restore', async (req, res) => {
    const client = await pool.connect();
    try {
        const data = req.body;
        
        if (!data.ventas || !data.gastos) {
            return res.status(400).json({ 
                success: false, 
                error: 'Formato de respaldo inválido' 
            });
        }
        
        // Iniciar transacción
        await client.query('BEGIN');
        
        // Limpiar tablas
        await client.query('DELETE FROM ventas');
        await client.query('DELETE FROM gastos');
        await client.query('DELETE FROM menu_comida_corrida');
        
        // Restaurar ventas
        for (const venta of data.ventas) {
            await client.query(
                `INSERT INTO ventas (fecha, cliente, producto, monto, metodo_pago, notas) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [venta.fecha, venta.cliente, venta.producto, venta.monto, venta.metodoPago, venta.notas || '']
            );
        }
        
        // Restaurar gastos
        for (const gasto of data.gastos) {
            await client.query(
                `INSERT INTO gastos (fecha, categoria, descripcion, monto, proveedor, notas) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [gasto.fecha, gasto.categoria, gasto.descripcion, gasto.monto, gasto.proveedor || '', gasto.notas || '']
            );
        }
        
        // Restaurar menú
        if (data.menuComidaCorrida) {
            for (const dia in data.menuComidaCorrida) {
                for (const tiempo in data.menuComidaCorrida[dia]) {
                    for (const opcion in data.menuComidaCorrida[dia][tiempo]) {
                        const platillo = data.menuComidaCorrida[dia][tiempo][opcion];
                        await client.query(
                            `INSERT INTO menu_comida_corrida (dia, tiempo, opcion, nombre, descripcion)
                             VALUES ($1, $2, $3, $4, $5)`,
                            [dia, tiempo, parseInt(opcion), platillo.nombre, platillo.descripcion || '']
                        );
                    }
                }
            }
        }
        
        // Confirmar transacción
        await client.query('COMMIT');
        
        res.json({ success: true, message: 'Datos restaurados exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error restaurando backup:', error);
        res.status(500).json({ success: false, error: 'Error restaurando datos' });
    } finally {
        client.release();
    }
});

// ==================== INICIAR SERVIDOR ====================

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`💾 Base de datos PostgreSQL conectada`);
    });
}).catch(error => {
    console.error('Error fatal iniciando servidor:', error);
    process.exit(1);
});
