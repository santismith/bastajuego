// Conectarse al servidor
const socket = io();

// --- Elementos del DOM ---
const ruleDisplay = document.getElementById('current-rule');
const alphabetGrid = document.getElementById('alphabet-grid');
const inputRule = document.getElementById('input-rule');
const btnStartRound = document.getElementById('btn-start-round');

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// --- Eventos (Enviar al Servidor) ---

// 1. El Host empieza la ronda
btnStartRound.addEventListener('click', () => {
  const rule = inputRule.value;
  if (rule) {
    // Le avisamos al servidor que inicie la ronda con esta regla
    socket.emit('round:start', rule);
  }
});

// 2. Función para cuando se presiona una letra
function onLetterClick(letter) {
  // Le avisamos al servidor que esta letra se usó
  socket.emit('letter:use', letter);
}

// --- Eventos (Recibir del Servidor) ---

// 3. El servidor nos envía el estado actualizado del juego
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
    
    // Si la letra está en la lista de "usadas", la deshabilitamos
    if (gameState.usedLetters.includes(letter)) {
      btn.disabled = true;
    }
    
    // Le damos su función de click
    btn.addEventListener('click', () => onLetterClick(letter));
    
    // La agregamos al grid
    alphabetGrid.appendChild(btn);
  });
});