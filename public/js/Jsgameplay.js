// Import symbols and initial game state
const statut = document.querySelector("h2");
let jeuActif = true;
let joueurActif = "X";
let etatJeu = ["", "", "", "", "", "", "", "", ""];
let myTurn = false; // Variable to track if it's the current player's turn

// Define the winning conditions
const conditionsVictoire = [
    [0, 5, 6],
    [1, 4, 7],
    [2, 3, 8],
    [0, 1, 2],
    [5, 4, 3],
    [6, 7, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Messages
const gagne = () => `Le joueur ${joueurActif} a gagné`;
const egalite = () => "Egalité";
const tourJoueur = () => `C'est au tour du joueur ${joueurActif}`;

// Display which player starts
statut.innerHTML = tourJoueur();

// Function to enable/disable grid interaction based on turn
function enableGridInteraction(enable) {
    document.querySelectorAll("td[data-index]").forEach(cell => {
        cell.removeEventListener("click", gestionClicgrid); // Remove click event listener
        if (enable) {
            cell.addEventListener("click", gestionClicgrid); // Add click event listener if it's the player's turn
        }
    });
}

// Set up event listeners
document.querySelectorAll("td[data-index]").forEach(cell => cell.addEventListener("click", gestionClicgrid));

// Add an event listener for the 'yourTurn' event
socket.on('yourTurn', () => {
    myTurn = true; // Set myTurn to true when it's the current player's turn
    enableGridInteraction(true); // Enable grid interaction
});

// Convert symbols to 1 or 2 for MQTT transmission. The value 0 is for nothing on the matrix
const playerSymbole = {
    "X": 1,
    "O": 2
};

// Add an event listener for the 'updateGame' event
socket.on('updateGame', ({ indexgrid, convertionSymbole }) => {
    // Handle the incoming move and update the game state
    updateGameState(indexgrid, convertionSymbole);
});

// Add an event listener for the 'disableCell' event
socket.on('disableCell', (indexgrid) => {
    // Call the disableCell function to disable the cell on the client side
    disableCell(indexgrid);
});

function updateGameState(indexgrid, convertionSymbole) {
    // Update the game state based on the received move
    const cell = document.querySelector(`td[data-index="${indexgrid}"]`);

    if (cell) {
        // Set a data attribute to track the symbol in the cell
        cell.dataset.symbol = joueurActif;

        // Update any other game-related logic as needed
        verifGagne();
    }
}

function gestionClicgrid() {
    if (!myTurn) return; // Prevent interaction if it's not the current player's turn

    const indexgrid = parseInt(this.dataset.index);
    var convertionSymbole = playerSymbole[joueurActif];

    // Check if the cell is already filled or the game is over
    if (etatJeu[indexgrid] !== "" || !jeuActif) {
        return;
    }

    // Set a data attribute to track the symbol in the cell
    this.dataset.symbol = joueurActif;

    // Add the "disabled" class to the clicked cell
    this.classList.add("disabled");

    // Write the player's symbol to the etatJeu array
    etatJeu[indexgrid] = joueurActif;

    // Emit data to the server via Socket.IO with the cell index and action
    socket.emit('playerMove', { indexgrid, convertionSymbole, action: 'disableCell' });

    // Check for a win
    verifGagne();

    myTurn = false; // Reset myTurn after making a move
    enableGridInteraction(false); // Disable grid interaction until it's the player's turn again
}

function disableCell(indexgrid) {
    // Disable the specified cell on the client side
    const cell = document.querySelector(`td[data-index="${indexgrid}"]`);
    if (cell) {
        cell.classList.add("disabled");
    }
}

// Check if the player has won
function verifGagne() {
    let tourGagnant = false;

    // Winning conditions
    for (let conditionVictoire of conditionsVictoire) {
        // Get the 3 cells of the winning condition
        let val1 = etatJeu[conditionVictoire[0]];
        let val2 = etatJeu[conditionVictoire[1]];
        let val3 = etatJeu[conditionVictoire[2]];

        // If all 3 cells are identical and not empty
        if (val1 !== "" && val1 === val2 && val2 === val3) {
            // Win
            tourGagnant = true;
            break;
        }
    }

    // If we won
    if (tourGagnant) {
        joueurActif = playerName;
        statut.innerHTML = gagne();
        jeuActif = false;
        console.log(playerSymbole[joueurActif], 'win');

        // Add an event handler to the button
        document.querySelector(".restart").addEventListener("click", recommencer);

        // Emit a message to the server indicating the win
        socket.emit('playerWin', { playerName: joueurActif, jeuActif: false });
        resetMatrix()
        return;
    }

    // If all cells are filled
    if (!etatJeu.includes("")) {
        statut.innerHTML = egalite();
        jeuActif = false;
        console.log(playerSymbole[joueurActif], 'egalité');

        // Add an event handler to the button
        document.querySelector(".restart").addEventListener("click", recommencer);

        // Emit a message to the server indicating a tie
        socket.emit('gameTie', { jeuActif: false });
        resetMatrix()
        return;
    }

    // Switch players
    joueurActif = joueurActif === "X" ? "O" : "X";
    statut.innerHTML = tourJoueur();
}

// Add an event listener for the 'playerWin' event
socket.on('playerWin', ({ playerName, jeuActif }) => {
    const emitgagne = () => `Le joueur ${playerName} a gagné`;
    console.log(`Player ${playerName} has won!`);
    jeuActif = false; // Assuming you're using this variable to control the game state
    document.querySelectorAll("td[data-index]").forEach(cell => cell.removeEventListener("click", gestionClicgrid));
    statut.innerHTML = emitgagne();
});

socket.on('gameTie', ({ jeuActif }) => {
    console.log(`Egalité`);
    jeuActif = false; // Assuming you're using this variable to control the game state
    document.querySelectorAll("td[data-index]").forEach(cell => cell.removeEventListener("click", gestionClicgrid));
    statut.innerHTML = egalite();
});

function resetMatrix() { // This function is to restart all the matrix when the game is over
    socket.emit('restartMatrix');
}

// Reset the game 
function recommencer() {
    window.location.reload();
}
