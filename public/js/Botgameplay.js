const statut = document.getElementById("statut")
let jeuActif = true
let joueurActif = "X"
let etatJeu = ["", "", "", "", "", "", "", "", ""]

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

// messages
const tie = () => "Egalité"
const tourJoueur = () => `C'est au tour du joueur ${joueurActif}`

// On affiche quel joueur commence
statut.innerHTML = tourJoueur()

// On met en place les écouteurs d'évènements
document.querySelectorAll("td[data-index]").forEach(cell => cell.addEventListener("click", gestionClicgrid));

// Convertit les symboles en 1 ou 2 pour l'envoie MQTT
const playerSymbole = {
    "X": 1,
    "O": 2
}

function checkOpponentWin() {
    // Determine the opponent's symbol
    let opponentSymbol = joueurActif === "X" ? "O" : "X";

    // Check each winning condition for the opponent's symbol
    for (let condition of conditionsVictoire) {
        let [a, b, c] = condition;
        if (etatJeu[a] === opponentSymbol && etatJeu[b] === opponentSymbol && etatJeu[c] === opponentSymbol) {
            // Set the status message to indicate that the player loses
            statut.innerHTML =  lose();
            // Trigger the defeat alert
            // Set the game to inactive
            jeuActif = false;
            return true; // Opponent has won
        }
    }
    return false; // Opponent has not won
}

// Fonction pour effectuer le mouvement de l'IA
function jouerIA() {
    // Check if AI can win in the next move
    for (let i = 0; i < conditionsVictoire.length; i++) {
        const [a, b, c] = conditionsVictoire[i];
        if (etatJeu[a] === "O" && etatJeu[b] === "O" && etatJeu[c] === "") {
            return c;
        }
        if (etatJeu[a] === "O" && etatJeu[c] === "O" && etatJeu[b] === "") {
            return b;
        }
        if (etatJeu[b] === "O" && etatJeu[c] === "O" && etatJeu[a] === "") {
            return a;
        }
    }

    // Check if player can win in the next move and block them
    for (let i = 0; i < conditionsVictoire.length; i++) {
        const [a, b, c] = conditionsVictoire[i];
        if (etatJeu[a] === "X" && etatJeu[b] === "X" && etatJeu[c] === "") {
            return c;
        }
        if (etatJeu[a] === "X" && etatJeu[c] === "X" && etatJeu[b] === "") {
            return b;
        }
        if (etatJeu[b] === "X" && etatJeu[c] === "X" && etatJeu[a] === "") {
            return a;
        }
    }

    // Choose a random empty cell
    const emptyCells = [];
    for (let i = 0; i < etatJeu.length; i++) {
        if (etatJeu[i] === "") {
            emptyCells.push(i);
        }
    }
    if (emptyCells.length === 0) {
        return -1; // No empty cells left (shouldn't happen in a correct game)
    }
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return randomIndex;
}


// Variable to keep track of whose turn it is
let isPlayerTurn = true;

// Default starting player
let playerStartsWith = "X";

// Randomly determine the starting player
if (Math.random() < 0.5) {
    playerStartsWith = "O"; // 50% chance of starting with "O"
}

if (playerStartsWith === "O") {
    joueurActif = "X"; // Robot starts with "X" if player starts with "O"
}

function gestionClicgrid() {
    // Check if it's the player's turn
    if (!isPlayerTurn || !jeuActif) {
        return;
    }

    const indexgrid = parseInt(this.dataset.index);
    var convertionSymbole = playerSymbole[joueurActif];

    // Vérifier si la case est déjà remplie
    if (etatJeu[indexgrid] !== "") {
        this.classList.add("disabled"); // Add the "disabled" class to the clicked cell
        return;
    }

    this.innerHTML = "";
    etatJeu[indexgrid] = joueurActif;

    // Add the "disabled" class to the clicked cell
    this.classList.add("disabled");

    console.log(`${indexgrid}.${convertionSymbole}`);
    verifGagne();

    // Change the active player after the current player has made a move
    isPlayerTurn = false;
    joueurActif = "O";
    statut.innerHTML = tourJoueur();

    // Mouvement de l'IA avec un délai de 1 seconde (1000 millisecondes)
    if (jeuActif && joueurActif === "O") {
        setTimeout(() => {
            const aiMoveIndex = jouerIA();
            if (aiMoveIndex !== -1) {
                etatJeu[aiMoveIndex] = "O";
                const aiCell = document.querySelector(`td[data-index="${aiMoveIndex}"]`);
                aiCell.innerHTML = "";
                aiCell.classList.add("disabled"); // Add the "disabled" class to the AI's cell
                var convertionSymbole = playerSymbole["O"];
                console.log(`${aiMoveIndex}.${convertionSymbole}`);
                verifGagne();
            }
            // Change the active player after the AI has made a move
            isPlayerTurn = true;
            joueurActif = "X";
            statut.innerHTML = tourJoueur();
        }, 1000); // Délai de 1 seconde
    }
}

// vérifie si le joueur a gagné
function verifGagne() {
    let tourGagnant = false;

    // les conditions de victoire
    for (let conditionVictoire of conditionsVictoire) {
        // On récupère les 3 cases de la condition de victoire
        let val1 = etatJeu[conditionVictoire[0]];
        let val2 = etatJeu[conditionVictoire[1]];
        let val3 = etatJeu[conditionVictoire[2]];

        // si l'une des cases est vide
        if (val1 === "" || val2 === "" || val3 === "") {
            continue;
        }

        // si les 3 cases sont identiques
        if (val1 === val2 && val2 === val3) {
            // on gagne
            tourGagnant = true;
            break;
        }
    }

    if (tourGagnant) {
        if (joueurActif === "O") {
            // If the AI wins, display "L'IA a gagné"
            statut.innerHTML = "L'IA a gagné";
        } else {
            // If the player wins, display the player's symbol and "a gagné"
            statut.innerHTML = `Tu as gagné`;
        }
        jeuActif = false;
        console.log(playerSymbole[joueurActif], 'win');
        // Add an event handler to the button
        document.querySelector(".restart").addEventListener("click", recommencer);
        // Emit a message to the server indicating the win
        socket.emit('playerWin', { jeuActif: false });
        return;
    }

    // If all cells are filled
    if (!etatJeu.includes("")) {
        statut.innerHTML = tie();
        jeuActif = false;
        console.log(playerSymbole[joueurActif], 'egalité');
        // Add an event handler to the button
        document.querySelector(".restart").addEventListener("click", recommencer);
        // Emit a message to the server indicating a tie
        socket.emit('gameTie', { jeuActif: false });
        return;
    }

    // change de joueur
    joueurActif = joueurActif === "X" ? "O" : "X";
    statut.innerHTML = tourJoueur();
}

// réinitialise le jeu
function recommencer(){
    window.location.reload();
}
