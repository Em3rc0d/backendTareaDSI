const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
app.use(cors({
    origin: 'https://tarea-dsi.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

const uri = "mongodb+srv://farid:emerc0d@cluster0.sguno.mongodb.net/tareaDSI?retryWrites=true&w=majority&appName=Cluster0";

let client;

// Conectar a MongoDB una vez y reutilizar la conexión
async function connectToMongoDB() {
    if (!client) {
        try {
            client = new MongoClient(uri, {
                serverApi: {
                    version: ServerApiVersion.v1,
                    strict: true,
                    deprecationErrors: true,
                }
            });
            await client.connect();
            await client.db("admin").command({ ping: 1 });
            console.log("Conectado a MongoDB correctamente.");
        } catch (error) {
            console.error("Error al conectar a MongoDB:", error);
            throw error; // Lanzar el error para manejarlo al llamar a esta función
        }
    }
}

app.post('/contact', async (req, res) => {
    try {
        await connectToMongoDB();  // Asegúrate de que la conexión esté activa

        const { nombreCompleto, correo, mensaje } = req.body;

        console.log("Cuerpo de la solicitud:", req.body);

        if (!nombreCompleto || !correo || !mensaje) {
            return res.status(400).send({ message: 'Todos los campos son obligatorios' });
        }

        const database = client.db("tareaDSI");
        const collection = database.collection("contacts");

        const result = await collection.insertOne({ nombreCompleto, correo, mensaje });
        
        res.status(201).send({ message: 'Mensaje recibido', data: result });
    } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).send({ message: 'Error al guardar el mensaje', error: error.message });
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
        })
        .catch(error => {
            console.error("Error al iniciar el servidor:", error);
            process.exit(1); // Salir si hay un error al conectar
        });
}
