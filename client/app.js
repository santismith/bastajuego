// Conectarse al servidor
const socket = io();

// --- Elementos del DOM ---
const ruleDisplay = document.getElementById('current-rule');
const alphabetGrid = document.getElementById('alphabet-grid');
const inputRule = document.getElementById('input-rule');
const btnStartRound = document.getElementById('btn-start-round');

// 1. OBTENEMOS EL NUEVO BOTÓN
const btnResetGame = document.getElementById('btn-reset-game');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// --- Eventos (Enviar al Servidor) ---

// El Host empieza la ronda
btnStartRound.addEventListener('click', () => {
  const rule = inputRule.value;
  if (rule) {
    socket.emit('round:start', rule);
  }
});

// 2. AÑADIMOS EL EVENTO DEL NUEVO BOTÓN
btnResetGame.addEventListener('click', () => {
  // Avisamos al servidor que reinicie todo
  socket.emit('round:reset');
  inputRule.value = ""; // Limpiamos el campo de regla
});

// Función para cuando se presiona una letra
function onLetterClick(letter) {
  socket.emit('letter:use', letter);
}

// --- Eventos (Recibir del Servidor) ---

// El servidor nos envía el estado actualizado del juego
socket.on('game:updateState', (gameState) => {
  console.log("Estado actualizado recibido:", gameState);

  // Actualizamos la regla en la pantalla
  ruleDisplay.innerText = gameState.rule;

  // Volvemos a dibujar el tablero de letras
  alphabetGrid.innerHTML = ''; // Limpiamos el tablero

  alphabet.forEach(letter => {
    const btn = document.createElement('button');
    btn.innerText = letter;
    btn.classList.add('letter-btn');
    
    // 3. ¡LA LÓGICA CLAVE!
    // Deshabilitamos el botón si:
    //   A) El juego NO está corriendo (NUEVA REGLA)
    //   B) La letra ya fue usada (REGLA ANTIGUA)
    if (!gameState.isRunning || gameState.usedLetters.includes(letter)) {
      btn.disabled = true;
    }
    
    // Le damos su función de click
    btn.addEventListener('click', () => onLetterClick(letter));
    
    // La agregamos al grid
    alphabetGrid.appendChild(btn);
  });
});