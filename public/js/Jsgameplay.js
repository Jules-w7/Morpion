// Import symbols and initial game state
const statut = document.querySelector("h2");
let jeuActif = true;
let joueurActif = "X";
let etatJeu = ["", "", "", "", "", "", "", "", ""];

// Define the winning conditions
const conditionsVictoire = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// Messages
const gagne = () => `Le joueur ${joueurActif} a gagné`;
const egalite = () => "Egalité";
const tourJoueur = () => `C'est au tour du joueur ${joueurActif}`;

// Display which player starts
statut.innerHTML = tourJoueur();

// Set up event listeners
document.querySelectorAll("td[data-index]").forEach(cell => cell.addEventListener("click", gestionClicgrid));

// Convert symbols to 1 or 2 for MQTT transmission
const playerSymbole = {
    "X": 0,
    "O": 1
};

// Add an event listener for the 'updateGame' event
socket.on('updateGame', ({ indexgrid, joueurActif }) => {
    // Handle the incoming move and update the game state
    updateGameState(indexgrid, joueurActif);

    // Send MQTT message when a player makes a move
    sendMqttMessage(`${indexgrid}.${playerSymbole[joueurActif]}`);
});

function updateGameState(indexgrid, joueurActif) {
    // Update the game state based on the received move
    const cell = document.querySelector(`td[data-index="${indexgrid}"]`);

    if (cell) {
        const imgElement = document.createElement("img");
        imgElement.src = joueurActif === "X" ? "../images/croix1.png" : "../images/rond1.png";
        imgElement.alt = joueurActif;

        // Replace innerHTML with the img element
        cell.innerHTML = "";
        cell.appendChild(imgElement);
    }

    // Update any other game-related logic as needed
    verifGagne();
}

function gestionClicgrid() {
    const indexgrid = parseInt(this.dataset.index);
    var convertionSymbole = playerSymbole[joueurActif];

    // Disable buttons to change symbol when clicking a cell on the grid
    document.querySelector(".croix1").disabled = true;
    document.querySelector(".rond1").disabled = true;

    // Check if the cell is already filled or the game is over
    if (etatJeu[indexgrid] !== "" || !jeuActif) {
        return;
    }

    // Create an img element with the image source
    const imgElement = document.createElement("img");

<<<<<<< HEAD
        // Determine which player is active and set the appropriate image source
        if (joueurActif === "X") {
            imgElement.src = "../images/croix1.png"; // Replace with the actual path to croix1.png
        } else {
            imgElement.src = "../images/rond1.png"; // Replace with the actual path to rond1.png
        }

        imgElement.alt = joueurActif; // You can set alt attribute if needed

        // Replace innerHTML with the img element
        this.innerHTML = "";
        this.appendChild(imgElement);

        // Write the player's symbol to the etatJeu array
        etatJeu[indexgrid] = joueurActif;
        
        // Send the data to the server via Socket.IO
        socket.emit('playerMove', { indexgrid, convertionSymbole });

        // Check for a win
        verifGagne();
=======
    // Determine which player is active and set the appropriate image source
    if (joueurActif === "X") {
        imgElement.src = "../images/croix1.png"; // Replace with the actual path to croix1.png
    } else {
        imgElement.src = "../images/rond1.png"; // Replace with the actual path to rond1.png
>>>>>>> parent of fb63fd5 (Fixed bug #3)
    }

    imgElement.alt = joueurActif; // You can set alt attribute if needed

    // Replace innerHTML with the img element
    this.innerHTML = "";
    this.appendChild(imgElement);

    // Write the player's symbol to the etatJeu array
    etatJeu[indexgrid] = joueurActif;
    console.log(`${indexgrid}.${convertionSymbole}`);

    // Emit the player move to the server
    emitPlayerMove(indexgrid, joueurActif);

    // Check for a win
    verifGagne();
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
        statut.innerHTML = gagne();
        jeuActif = false;
        console.log(playerSymbole[joueurActif], 'win');

        // Add an event handler to the button
        document.querySelector(".restart").addEventListener("click", recommencer);

        // Send MQTT message for the win
        sendMqttMessage(`${playerSymbole[joueurActif]}.win`);
        
        return;
    }

    // If all cells are filled
    if (!etatJeu.includes("")) {
        statut.innerHTML = egalite();
        jeuActif = false;
        console.log(playerSymbole[joueurActif], 'egalité');

        // Add an event handler to the button
        document.querySelector(".restart").addEventListener("click", recommencer);
        
        // Send MQTT message for the tie
        sendMqttMessage(`${playerSymbole[joueurActif]}.tie`);

        return;
    }

    // Switch players
    joueurActif = joueurActif === "X" ? "O" : "X";
    statut.innerHTML = tourJoueur();
}

// Reset the game
function recommencer() {
    window.location.reload();
}

// Add an event handler to the symbol selection button
document.querySelector(".croix1").addEventListener("click", function () {
    choisirSymbole("X");
});

document.querySelector(".rond1").addEventListener("click", function () {
    choisirSymbole("O");
});

// Function to handle symbol selection
function choisirSymbole(nouveauSymbole) {
    if (nouveauSymbole.toUpperCase() === "X" || nouveauSymbole.toUpperCase() === "O") {
        joueurActif = nouveauSymbole.toUpperCase();
        statut.innerHTML = tourJoueur();
    }
    if (nouveauSymbole.toUpperCase() === "O" || nouveauSymbole.toUpperCase() === "X") {
        joueurActif = nouveauSymbole.toUpperCase();
        statut.innerHTML = tourJoueur();
    }
}