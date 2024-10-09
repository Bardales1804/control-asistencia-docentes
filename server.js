const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;

// Configuración de la fecha y hora actual
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); 
const day = String(now.getDate()).padStart(2, '0');
const fechaEscaneo = `${year}-${month}-${day}`;

const hour = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
const horaEscaneo = `${hour}:${minutes}:${seconds}`;

// Middleware para procesar el body y servir archivos estáticos
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Conexión a la base de datos MySQL con Railway
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'autorack.proxy.rlwy.net', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'qCuLHkjNozzijLtZndywbzriKjmyZDcd',
    database: process.env.DB_NAME || 'railway',
    port: process.env.DB_PORT || 10266
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos establecida con éxito');
        connection.release();
    }
});

// Función para ejecutar consultas MySQL usando Promesas
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Servir el archivo `login.html` en la ruta raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// =====================
// CRUD API Docentes
// =====================
app.get('/api/docentes', async (req, res) => {
    try {
        const docentes = await query('SELECT * FROM Docentes');
        res.json(docentes);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/docentes/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const [docente] = await query('SELECT * FROM Docentes WHERE Codigo = ?', [codigo]);
        if (docente) {
            res.json(docente);
        } else {
            res.status(404).json({ message: 'Docente no encontrado' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/docentes', async (req, res) => {
    try {
        const { Codigo, Nombres, Apellidos, Fecha_nacimiento, Telefono, Correo_electronico, Fecha_ingreso } = req.body;
        await query(
            'INSERT INTO Docentes (Codigo, Nombres, Apellidos, Fecha_nacimiento, Telefono, Correo_electronico, Fecha_ingreso) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE Nombres = ?, Apellidos = ?, Fecha_nacimiento = ?, Telefono = ?, Correo_electronico = ?, Fecha_ingreso = ?',
            [Codigo, Nombres, Apellidos, Fecha_nacimiento, Telefono, Correo_electronico, Fecha_ingreso, Nombres, Apellidos, Fecha_nacimiento, Telefono, Correo_electronico, Fecha_ingreso]
        );
        res.status(201).send('Docente creado o actualizado');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/api/docentes/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const { Nombres, Apellidos, Fecha_nacimiento, Telefono, Correo_electronico, Fecha_ingreso } = req.body;
    try {
        await query(
            'UPDATE Docentes SET Nombres = ?, Apellidos = ?, Fecha_nacimiento = ?, Telefono = ?, Correo_electronico = ?, Fecha_ingreso = ? WHERE Codigo = ?',
            [Nombres, Apellidos, Fecha_nacimiento, Telefono, Correo_electronico, Fecha_ingreso, codigo]
        );
        res.send({ message: 'Docente actualizado con éxito' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/api/docentes/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        await query('DELETE FROM Docentes WHERE Codigo = ?', [codigo]);
        res.send('Docente eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// =====================
// CRUD API Horarios
// =====================
app.get('/api/horarios', async (req, res) => {
    try {
        const horarios = await query('SELECT * FROM Horarios');
        res.json(horarios);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/horarios/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const horarios = await query('SELECT * FROM Horarios WHERE Codigo = ?', [codigo]);
        res.json(horarios);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/horarios', async (req, res) => {
    try {
        const { Codigo, Dia_de_la_semana, Hora_entrada, Hora_salida } = req.body;
        await query(
            'INSERT INTO Horarios (Codigo, Dia_de_la_semana, Hora_entrada, Hora_salida) VALUES (?, ?, ?, ?)',
            [Codigo, Dia_de_la_semana, Hora_entrada, Hora_salida]
        );
        res.status(201).json({ message: 'Horario creado exitosamente' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/api/horarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Dia_de_la_semana, Hora_entrada, Hora_salida } = req.body;
        const result = await query(
            'UPDATE Horarios SET Dia_de_la_semana = ?, Hora_entrada = ?, Hora_salida = ? WHERE Id_horario = ?',
            [Dia_de_la_semana, Hora_entrada, Hora_salida, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }
        res.json({ message: 'Horario actualizado exitosamente' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/api/horarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM Horarios WHERE Id_horario = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }
        res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// =====================
// CRUD API Descansos
// =====================
app.post('/api/descansos', async (req, res) => {
    const { fecha, tipo_descanso, descripcion } = req.body;
    try {
        await query('INSERT INTO Descansos (Fecha, Tipo_descanso, Descripcion) VALUES (?, ?, ?)', [fecha, tipo_descanso, descripcion]);
        res.status(201).json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar descanso' });
    }
});

app.get('/api/descansos', async (req, res) => {
    try {
        const descansos = await query('SELECT * FROM Descansos');
        const eventos = descansos.map(descanso => ({
            title: descanso.Tipo_descanso,
            start: descanso.Fecha,
            description: descanso.Descripcion
        }));
        res.json(eventos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener descansos' });
    }
});

// =====================
// CRUD API Asistencias
// =====================
app.post('/asistencias', async (req, res) => {
    const { Codigo } = req.body; 
    const now = new Date(); 
    const Fecha = now.toISOString().split('T')[0];
    const Hora_de_entrada = now.toTimeString().split(' ')[0]; 
    const Observaciones = 'Asistencia registrada automáticamente';

    try {
        const asistenciaExistente = await query('SELECT * FROM asistencias WHERE Codigo = ? AND Fecha = ?', [Codigo, Fecha]);

        if (asistenciaExistente.length === 0) {
            await query('INSERT INTO asistencias (Codigo, Fecha, Hora_de_entrada, Observaciones) VALUES (?, ?, ?, ?)', [Codigo, Fecha, Hora_de_entrada, Observaciones]);
            res.status(200).json({ message: 'Asistencia registrada con éxito.' });
        } else {
            await query('UPDATE asistencias SET Hora_de_entrada = ?, Observaciones = ? WHERE Codigo = ? AND Fecha = ?', [Hora_de_entrada, Observaciones, Codigo, Fecha]);
            res.status(200).json({ message: 'Asistencia actualizada con éxito.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar la asistencia.' });
    }
});

// =====================
// CRUD API Carnets
// =====================
app.get('/carnets', async (req, res) => {
    try {
        const carnets = await query(`SELECT carnets.*, Docentes.Nombres, Docentes.Apellidos FROM carnets JOIN Docentes ON carnets.Codigo = Docentes.Codigo`);
        res.json(carnets);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los carnets.' });
    }
});

app.post('/carnets', async (req, res) => {
    const { Codigo, No_carnet, Fecha_emision, Fecha_vencimiento, Descripcion } = req.body;

    if (!Codigo || !No_carnet || !Fecha_emision || !Fecha_vencimiento) {
        return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    try {
        const docentes = await query('SELECT * FROM Docentes WHERE Codigo = ?', [Codigo]);
        if (docentes.length === 0) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        const result = await query(
            'INSERT INTO carnets (Codigo, No_carnet, Fecha_emision, Fecha_vencimiento, Descripcion) VALUES (?, ?, ?, ?, ?)',
            [Codigo, No_carnet, Fecha_emision, Fecha_vencimiento, Descripcion]
        );
        res.status(201).json({ message: 'Carnet creado exitosamente.', Id_carnet: result.insertId });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el carnet.' });
    }
});

// =====================
// CRUD API Eventos
// =====================
app.get('/api/eventos', async (req, res) => {
    try {
        const eventos = await query('SELECT * FROM Eventos');
        res.json(eventos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/eventos', async (req, res) => {
    try {
        const { Id_evento, Codigo, Titulo, Fecha_inicio, Fecha_fin, Lugar, Observaciones, Descripcion } = req.body;
        await query(
            'INSERT INTO Eventos (Id_evento, Codigo, Titulo, Fecha_inicio, Fecha_fin, Lugar, Observaciones, Descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE Codigo = ?, Titulo = ?, Fecha_inicio = ?, Fecha_fin = ?, Lugar = ?, Observaciones = ?, Descripcion = ?',
            [Id_evento, Codigo, Titulo, Fecha_inicio, Fecha_fin, Lugar, Observaciones, Descripcion, Codigo, Titulo, Fecha_inicio, Fecha_fin, Lugar, Observaciones, Descripcion]
        );
        res.status(201).send('Evento creado o actualizado');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// =====================
// CRUD API Permisos
// =====================
app.get('/api/permisos', async (req, res) => {
    try {
        const permisos = await query('SELECT * FROM Permisos');
        res.json(permisos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/api/permisos/docente/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const permisos = await query('SELECT * FROM Permisos WHERE Codigo = ?', [codigo]);
        res.json(permisos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/permisos', async (req, res) => {
    try {
        const { Codigo, Fecha_permiso, Motivo, Descripcion } = req.body;
        await query(
            'INSERT INTO Permisos (Codigo, Fecha_permiso, Motivo, Descripcion) VALUES (?, ?, ?, ?)',
            [Codigo, Fecha_permiso, Motivo, Descripcion]
        );
        res.status(201).send('Permiso creado');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.put('/api/permisos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Codigo, Fecha_permiso, Motivo, Descripcion } = req.body;
        const result = await query(
            'UPDATE Permisos SET Codigo = ?, Fecha_permiso = ?, Motivo = ?, Descripcion = ? WHERE Id_permiso = ?',
            [Codigo, Fecha_permiso, Motivo, Descripcion, id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Permiso no encontrado' });
        } else {
            res.json({ message: 'Permiso actualizado con éxito' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.delete('/api/permisos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM Permisos WHERE Id_permiso = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Permiso no encontrado' });
        } else {
            res.json({ message: 'Permiso eliminado con éxito' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// =====================
// CRUD API Planilla
// =====================
app.get('/api/planilla', async (req, res) => {
    try {
        const planillas = await query('SELECT * FROM Planilla');
        res.json(planillas);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/api/planilla', async (req, res) => {
    try {
        const { Codigo, Mes, Firma_planilla, Observaciones } = req.body;
        if (!Codigo || !Mes || !Firma_planilla) {
            return res.status(400).json({ message: 'Código, Mes y Firma_planilla son obligatorios.' });
        }
        await query(
            'INSERT INTO Planilla (Codigo, Mes, Firma_planilla, Observaciones) VALUES (?, ?, ?, ?)',
            [Codigo, Mes, Firma_planilla, Observaciones]
        );
        res.status(201).json({ message: 'Planilla registrada con éxito' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// =====================
// Iniciar el servidor
// =====================
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
