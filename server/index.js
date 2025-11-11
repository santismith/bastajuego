const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 3000;

// Servir los archivos del cliente (HTML, CSS, JS)
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// --- Estado del Juego (Simple) ---
// Esto es lo único que guardará nuestro servidor
let gameState = {
  rule: "¡Bienvenidos! El Host debe iniciar la ronda.",
  usedLetters: [] // Ej: ['A', 'C', 'L']
};

io.on('connection', (socket) => {
  console.log('Un jugador se ha conectado:', socket.id);

  // 1. Apenas se conecta, le enviamos el estado actual del juego
  socket.emit('game:updateState', gameState);

  // 2. Cuando el "Host" inicia una nueva ronda
  socket.on('round:start', (newRule) => {
    gameState.rule = newRule;
    gameState.usedLetters = []; // Limpiamos las letras
    
    // Le avisamos a TODOS los jugadores el nuevo estado
    io.emit('game:updateState', gameState);
    console.log(`Nueva ronda iniciada. Regla: ${newRule}`);
  });

  // 3. Cuando un jugador usa una letra
  socket.on('letter:use', (letter) => {
    // Si la letra no estaba usada, la agregamos
    if (!gameState.usedLetters.includes(letter)) {
      gameState.usedLetters.push(letter);
      
      // Le avisamos a TODOS los jugadores que la letra se usó
      io.emit('game:updateState', gameState);
      console.log(`Letra usada: ${letter}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Un jugador se ha desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor "Basta" (Reglas nuevas) corriendo en http://localhost:${PORT}`);
});
