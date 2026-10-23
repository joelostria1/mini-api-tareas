const { DataSource, EntitySchema } = require('typeorm');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
require('reflect-metadata');
app.use(express.json());

const TOKEN = '6e4100cb9fc7b69bdc56e30b83fafd577e2ec5f6bdf94f54e680c7fad27f4ca5';

const TareaEntity = new EntitySchema({
    name: 'Tarea',
    tableName: 'tareas',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid',
        },
        titulo: {
            type: 'varchar',
            nullable: false,
        },
        descripcion: {
            type: 'text',
            nullable: true,
        },
        completado: {
            type: 'boolean',
            default: false,
        },
        fechaCreacion: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
    },
});

//conexion a postgres
const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Nada1234.',
    database: 'prueba',
    synchronize: true,
    logging: false,
    entities: [TareaEntity],
});

dataSource.initialize()
    .then(() => {
        console.log('Conexion exitosa a base de datos');
    })
    .catch((err) => {
        console.error('Error al conectar', err);
    });

const tareaRepository = dataSource.getRepository('Tarea');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    if (token !== TOKEN) {
        return res.status(403).json({ message: 'Token inválido' });
    }

    next();
};

// app.use(authMiddleware);

//Metodo para listar tareas
app.get('/tareas', authMiddleware, async (req, res) => {
    try {
        const tareas = await tareaRepository.find();
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las tareas' });
    }
});

//Metodo para crear tareas
app.post('/tareas', authMiddleware, async (req, res) => {
    const { titulo, descripcion, completado } = req.body;
    const nuevaTarea = tareaRepository.create({ titulo, descripcion, completado });
    try {
        const guardado = await tareaRepository.save(nuevaTarea);
        res.status(201).json(guardado);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la tarea' });
    }
});

//Metodo para actualizar tareas
app.put('/tareas/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, completado } = req.body;

    try {
        const tarea = await tareaRepository.findOneBy({ id });
        if (!tarea) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        tareaRepository.merge(tarea, { titulo, descripcion, completado });
        const actualizado = await tareaRepository.save(tarea);
        res.json(actualizado);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la tarea' });
    }
});

//Metodo para eliminar tareas
app.delete('/tareas/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const tarea = await tareaRepository.findOneBy({ id });
        if (!tarea) {
            return res.status(404).json({ message: 'Tarea no encontrada' });
        }

        await tareaRepository.remove(tarea);
        res.json({ message: 'Tarea eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la tarea' });
    }
});

//Metodo para levantar server
app.listen(port, () => {
    console.log(`levantado en http://localhost:${port}`);
});