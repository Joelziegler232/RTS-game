const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const mongoose = require('mongoose');
const messagesRoutes = require('./routes/messagesRoutes');

// Configuración de middleware y rutas
app.use(express.json());
app.use('/api', messagesRoutes);
const { connect } = require('@/app/libs/mongodb'); // Asegúrate de proporcionar la ruta correcta a tu archivo de conexión

connect().then((connected: any) => {
  if (connected) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
  } else {
    console.error('No se pudo conectar a MongoDB Atlas');
  }
});

app.get('/', (req: any, res: any) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket: any) => {
  console.log('Un usuario se ha conectado');

  // Manejar eventos de chat
  socket.on('chat message', (msg: any) => {
    io.emit('chat message', msg); // Enviar mensaje a todos los clientes conectados
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
