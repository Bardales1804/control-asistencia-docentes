const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000; // Usa el puerto de la variable de entorno si está definido

// Configuración de fecha y hora para los escaneos
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0'); // getMonth() retorna 0-11
const day = String(now.getDate()).padStart(2, '0');
const fechaEscaneo = `${year}-${month}-${day}`; // Formato YYYY-MM-DD en hora local

const hour = String(now.getHours()).padStart(2, '0');
const minutes = String(now.getMinutes()).padStart(2, '0');
const seconds = String(now.getSeconds()).padStart(2, '0');
const horaEscaneo = `${hour}:${minutes}:${seconds}`; // Formato HH:MM:SS en hora local

// Configurar conexión a la base de datos MySQL utilizando un pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost', // Usa las variables de entorno si están definidas
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'bardales1804',
    database: process.env.DB_NAME || 'CCCP',
    port: process.env.DB_PORT || 3306
});

// Función para ejecutar consultas a la base de datos
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) return reject(error);
            resolve(results);
        });
    });
};

// Configuración de middleware
app.use(cors({
    origin: '*', // Cambia '*' por la URL de tu frontend si es necesario
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public')); // Sirve imágenes y otros archivos estáticos

// Ruta para servir login.html en la raíz '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});



// =====================
// Rutas de la API Docentes
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
// Rutas de la API Horarios
// =====================
// Obtener todos los horarios (opcional)
app.get('/api/horarios', async (req, res) => {
    try {
        const horarios = await query('SELECT * FROM Horarios');
        res.json(horarios);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Obtener horarios por código de docente
app.get('/api/horarios/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const horarios = await query('SELECT * FROM Horarios WHERE Codigo = ?', [codigo]);
        res.json(horarios);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Crear un nuevo horario
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

// Actualizar un horario existente
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

// Eliminar un horario
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
// Rutas de la API Descansos
// =====================
app.post('/api/descansos', async (req, res) => {
    const { fecha, tipo_descanso, descripcion } = req.body;
    console.log('Datos recibidos:', req.body); // Log para verificar los datos
    try {
        await query('INSERT INTO Descansos (Fecha, Tipo_descanso, Descripcion) VALUES (?, ?, ?)', [fecha, tipo_descanso, descripcion]);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error al agregar descanso:', error);
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
        console.error('Error al obtener descansos:', error);
        res.status(500).json({ error: 'Error al obtener descansos' });
    }
});


// =====================
// Rutas de la API Asistencias
// =====================
// Ruta para registrar asistencias
app.post('/asistencias', async (req, res) => {
    const { Codigo } = req.body; // El código escaneado
    const now = new Date(); // Fecha y hora actual
    const Fecha = now.toISOString().split('T')[0]; // Obtener solo la fecha en formato YYYY-MM-DD
    const Hora_de_entrada = now.toTimeString().split(' ')[0]; // Obtener la hora actual en formato HH:MM:SS
    const Observaciones = 'Asistencia registrada automáticamente por lector de código de barras'; // Observaciones automáticas

    try {
        // Verificar si ya existe una asistencia para este código y fecha
        const asistenciaExistente = await query(
            'SELECT * FROM asistencias WHERE Codigo = ? AND Fecha = ?',
            [Codigo, Fecha]
        );

        if (asistenciaExistente.length === 0) {
            // Si no existe, insertar nueva asistencia
            await query(
                'INSERT INTO asistencias (Codigo, Fecha, Hora_de_entrada, Observaciones) VALUES (?, ?, ?, ?)',
                [Codigo, Fecha, Hora_de_entrada, Observaciones]
            );
            res.status(200).json({ message: 'Asistencia registrada con éxito.' });
        } else {
            // Si ya existe, actualizar la asistencia
            await query(
                'UPDATE asistencias SET Hora_de_entrada = ?, Observaciones = ? WHERE Codigo = ? AND Fecha = ?',
                [Hora_de_entrada, Observaciones, Codigo, Fecha]
            );
            res.status(200).json({ message: 'Asistencia actualizada con éxito.' });
        }
    } catch (error) {
        console.error('Error al registrar la asistencia:', error);
        res.status(500).json({ message: 'Error al registrar la asistencia.' });
    }
});

// Ruta para obtener todas las asistencias
app.get('/api/asistencias', async (req, res) => {
    const fecha = req.query.fecha;
    console.log('Fecha recibida:', fecha);

    let sql = 'SELECT * FROM asistencias';
    let params = [];

    if (fecha) {
        sql += ' WHERE Fecha = ?';
        params.push(fecha);
    }

    try {
        const asistencias = await query(sql, params);
        res.json(asistencias);
    } catch (error) {
        console.error('Error al obtener asistencias:', error);
        res.status(500).json({ message: 'Error al obtener asistencias' });
    }
});









// =====================
// Rutas de la API Carnets
// =====================

// Endpoint para obtener todos los carnets con información del docente
app.get('/carnets', async (req, res) => {
    try {
        const carnets = await query(`
            SELECT carnets.*, Docentes.Nombres, Docentes.Apellidos, Docentes.Correo_electronico
            FROM carnets
            JOIN Docentes ON carnets.Codigo = Docentes.Codigo
        `);
        res.json(carnets);
    } catch (error) {
        console.error('Error al obtener los carnets:', error);
        res.status(500).json({ message: 'Error al obtener los carnets.' });
    }
});

// Endpoint para crear un nuevo carnet
app.post('/carnets', async (req, res) => {
    const { Codigo, No_carnet, Fecha_emision, Fecha_vencimiento, Descripcion } = req.body;

    // Validar los datos
    if (!Codigo || !No_carnet || !Fecha_emision || !Fecha_vencimiento) {
        return res.status(400).json({ message: 'Faltan datos requeridos.' });
    }

    try {
        // Verificar que el docente existe
        const docentes = await query('SELECT * FROM Docentes WHERE Codigo = ?', [Codigo]);
        if (docentes.length === 0) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        // Insertar el carnet en la base de datos
        const result = await query(
            'INSERT INTO carnets (Codigo, No_carnet, Fecha_emision, Fecha_vencimiento, Descripcion) VALUES (?, ?, ?, ?, ?)',
            [Codigo, No_carnet, Fecha_emision, Fecha_vencimiento, Descripcion]
        );
        res.status(201).json({ message: 'Carnet creado exitosamente.', Id_carnet: result.insertId });
    } catch (error) {
        console.error('Error al crear el carnet:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: 'El número de carnet ya existe.' });
        } else {
            res.status(500).json({ message: 'Error al crear el carnet.' });
        }
    }
});

// Endpoint para eliminar un carnet por su ID
app.delete('/carnets/:id_carnet', async (req, res) => {
    const { id_carnet } = req.params;
    try {
        const result = await query('DELETE FROM carnets WHERE Id_carnet = ?', [id_carnet]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Carnet no encontrado.' });
        }
        res.json({ message: 'Carnet eliminado exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar el carnet:', error);
        res.status(500).json({ message: 'Error al eliminar el carnet.' });
    }
});





// =====================
// Rutas de la API Eventos
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

app.delete('/api/eventos/:id_evento', async (req, res) => {
    try {
        const { id_evento } = req.params;
        await query('DELETE FROM Eventos WHERE Id_evento = ?', [id_evento]);
        res.send('Evento eliminado');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// =====================
// Rutas de la API Permisos
// =====================
// Obtener todos los permisos
app.get('/api/permisos', async (req, res) => {
    try {
        const permisos = await query('SELECT * FROM Permisos');
        res.json(permisos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Obtener permisos por código de docente
app.get('/api/permisos/docente/:codigo', async (req, res) => {
    try {
        const { codigo } = req.params;
        const permisos = await query('SELECT * FROM Permisos WHERE Codigo = ?', [codigo]);
        res.json(permisos);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Obtener un permiso específico por ID
app.get('/api/permisos/id/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [permiso] = await query('SELECT * FROM Permisos WHERE Id_permiso = ?', [id]);
        if (permiso) {
            res.json(permiso);
        } else {
            res.status(404).json({ message: 'Permiso no encontrado' });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Crear un nuevo permiso
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

// Actualizar un permiso existente
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

// Eliminar un permiso
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
// Rutas de la API Planilla
// =====================
// Obtener todas las planillas
app.get('/api/planilla', async (req, res) => {
    try {
        const planillas = await query('SELECT * FROM Planilla');
        res.json(planillas);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Obtener planillas por código de docente
app.get('/api/planilla/codigo/:codigo', async (req, res) => { // Ruta modificada
    try {
        const { codigo } = req.params;
        const planillas = await query('SELECT * FROM Planilla WHERE Codigo = ?', [codigo]);
        res.json(planillas);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Crear una nueva planilla
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

// Eliminar una planilla
app.delete('/api/planilla/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await query('DELETE FROM Planilla WHERE Id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Planilla no encontrada' });
        }
        res.json({ message: 'Planilla eliminada con éxito' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// (Opcional) Actualizar una planilla
app.put('/api/planilla/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Mes, Firma_planilla, Observaciones } = req.body;
        const result = await query(
            'UPDATE Planilla SET Mes = ?, Firma_planilla = ?, Observaciones = ? WHERE Id = ?',
            [Mes, Firma_planilla, Observaciones, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Planilla no encontrada' });
        }
        res.json({ message: 'Planilla actualizada con éxito' });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.use('/barcodes', express.static(path.join(__dirname, 'public', 'barcodes')));


// =====================
// Iniciar el servidor
// =====================
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
