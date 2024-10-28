const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors'); // Importa cors

const app = express();
const port = process.env.PORT || 3000; // Cambiar a process.env.PORT

// Middleware para permitir solicitudes CORS
app.use(cors({
    origin: 'https://tarea-dsi.vercel.app', // Cambia esto por la URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

const uri = "mongodb+srv://farid:emerc0d@cluster0.sguno.mongodb.net/tareaDSI?retryWrites=true&w=majority&appName=Cluster0";

// Crear un cliente de MongoDB
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToMongoDB() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}

app.post('/contact', async (req, res) => {
    const { nombreCompleto, correo, mensaje } = req.body;

    if (!nombreCompleto || !correo || !mensaje) {
        return res.status(400).send({ message: 'Todos los campos son obligatorios' });
    }

    try {
        const database = client.db("tareaDSI");
        const collection = database.collection("contacts");
        
        const result = await collection.insertOne({ nombreCompleto, correo, mensaje });
        res.status(201).send({ message: 'Mensaje recibido', data: result });
    } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).send({ message: 'Error al guardar el mensaje' });
    }
});

app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

app.get('/try', (req, res) => {
    res.send('Hi');
});

// Exportar la aplicación para que Vercel pueda usarla
module.exports = app; 

// Conectar a MongoDB y iniciar el servidor localmente si no está en Vercel
if (require.main === module) {
    connectToMongoDB()
        .then(() => {
            app.listen(port, () => {
                console.log(`Servidor escuchando en http://localhost:${port}`);
            });
        });
}
