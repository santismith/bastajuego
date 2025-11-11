const express = require('express');
const http = require('http');
const { Server } = require("socket.io"); // <-- Aquí se importa
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server); // <-- Aquí se CREA 'io'
const PORT = 3000;

const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// --- Estado del Juego (Simple) ---
let gameState = {
  rule: "¡Bienvenidos! El Host debe iniciar la ronda.",
  usedLetters: [],
  isRunning: false // <-- 1. AÑADIMOS ESTA LÍNEA
};

io.on('connection', (socket) => {
  console.log('Un jugador se ha conectado:', socket.id);

  // Apenas se conecta, le enviamos el estado actual del juego
  socket.emit('game:updateState', gameState);

  // 2. Cuando el "Host" inicia una nueva ronda
  socket.on('round:start', (newRule) => {
    gameState.rule = newRule;
    gameState.usedLetters = [];
    gameState.isRunning = true; // <-- 2. EL JUEGO AHORA ESTÁ ACTIVO
    
    io.emit('game:updateState', gameState);
    console.log(`Nueva ronda iniciada. Regla: ${newRule}`);
  });

  // 3. Cuando un jugador usa una letra
  socket.on('letter:use', (letter) => {
    // Solo permitimos usar letras SI el juego está corriendo
    if (gameState.isRunning && !gameState.usedLetters.includes(letter)) {
      gameState.usedLetters.push(letter);
      io.emit('game:updateState', gameState);
      console.log(`Letra usada: ${letter}`);
    }
  });

  // 4. AÑADIMOS NUEVO EVENTO PARA REINICIAR
  socket.on('round:reset', () => {
    gameState.rule = "¡Bienvenidos! El Host debe iniciar la ronda.";
    gameState.usedLetters = [];
    gameState.isRunning = false; // El juego se detiene
    
    io.emit('game:updateState', gameState);
    console.log('Juego reseteado por el Host.');
  });


  socket.on('disconnect', () => {
    console.log('Un jugador se ha desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor "Basta" (Reglas nuevas) corriendo en http://localhost:${PORT}`);
});