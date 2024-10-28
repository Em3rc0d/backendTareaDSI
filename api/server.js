const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = 3000; // Puedes elegir cualquier puerto

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la URI de conexión de MongoDB desde la variable de entorno
const uri = process.env.MONGODB_URI;

// Crear un cliente de MongoDB
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToMongoDB() {
    try {
        // Conectar el cliente al servidor
        await client.connect();
        // Enviar un ping para confirmar una conexión exitosa
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
        // Guardar los datos en la base de datos
        const database = client.db("tareaDSI");
        const collection = database.collection("contacts");

        const result = await collection.insertOne({ nombreCompleto, correo, mensaje });
        res.status(201).send({ message: 'Mensaje recibido', data: result });
    } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).send({ message: 'Error al guardar el mensaje' });
    }
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Hola, mundo!');
});

// Iniciar el servidor
app.listen(port, async () => {
    await connectToMongoDB(); // Conectar a MongoDB cuando el servidor inicie
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
