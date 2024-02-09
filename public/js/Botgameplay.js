const statut = document.getElementById("yuriId")
let jeuActif = true
let joueurActif = "X"
let etatJeu = ["", "", "", "", "", "", "", "", ""]

// on définit les conditions de victoire
const conditionsVictoire = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

// messages
const gagne = () => `Le joueur ${joueurActif} a gagné`
const tie = () => "tu a fait égalité"
const lose = () => "tu as perdu"
const tourJoueur = () => `C'est au tour du joueur ${joueurActif}`

function winAlert() {
    alert('bravo mais facile');
  }
  function defeatAlert() {
    alert("meme en t'entrainent 10 ans dans les montagnes tu ne pourrais pas gagner contre une limace");
  }
  function drawAlert() {
    alert('Comment peux-tu faire match nul?');
  }

// On affiche quel joueur commence
statut.innerHTML = tourJoueur()

// On met en place les écouteurs d'évènements
document.querySelectorAll("td[data-index]").forEach(cell => cell.addEventListener("click", gestionClicgrid));

// Convertit les symboles en 1 ou 2 pour l'envoie MQTT
const playerSymbole = {
    "X": 0,
    "O": 1
}

function checkOpponentWin() {
    // Determine the opponent's symbol
    let opponentSymbol = joueurActif === "X" ? "O" : "X";

    // Check each winning condition for the opponent's symbol
    for (let condition of conditionsVictoire) {
        let [a, b, c] = condition;
        if (etatJeu[a] === opponentSymbol && etatJeu[b] === opponentSymbol && etatJeu[c] === opponentSymbol) {
            // Set the status message to indicate that the player loses
            statut.innerHTML = `Le joueur ${joueurActif} a perdu`;
            // Trigger the defeat alert
            defeatAlert();
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

    document.querySelector(".croix1").disabled = true;
    document.querySelector(".rond1").disabled = true;

    // Vérifier si la case est déjà remplie
    if (etatJeu[indexgrid] !== "") {
        return;
    }

    const imgElement = document.createElement("img");

    if (joueurActif === "X") {
        imgElement.src = "../images/croix1.png";
    } else {
        imgElement.src = "../images/rond1.png";
    }

    imgElement.alt = joueurActif;

    this.innerHTML = "";
    this.appendChild(imgElement);

    etatJeu[indexgrid] = joueurActif;
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
                const aiImgElement = document.createElement("img");
                aiImgElement.src = "../images/rond1.png";
                aiImgElement.alt = "O";
                aiCell.innerHTML = "";
                aiCell.appendChild(aiImgElement);
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

    // si on a gagné
    if (tourGagnant) {
        if (joueurActif === "X") {
            statut.innerHTML = gagne();
            setTimeout(winAlert, 1000);
            console.log(playerSymbole[joueurActif], 'win');
        } else {
            statut.innerHTML = lose()
            setTimeout(defeatAlert, 1000);
            console.log(playerSymbole[joueurActif], 'lose');
        }
        jeuActif = false;
        // Ajout d'un gestionnaire d'événements au bouton
        document.querySelector(".restart").addEventListener("click", recommencer);
        return;
    }

    // si toutes les cases sont remplies
    if (!etatJeu.includes("")) {
        statut.innerHTML = tie();
        console.log(playerSymbole[joueurActif], 'draw');
        //setTimeout(ti, 1000)
        // ajout d'un gestionnaire d'événements au bouton
        document.querySelector(".restart").addEventListener("click", recommencer);
        setTimeout(drawAlert, 1000)
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

// ajout d'un gestionnaire d'événements au bouton de choix de symbole
document.querySelector(".croix1").addEventListener("click", function() {
    choisirSymbole("X");
});

document.querySelector(".rond1").addEventListener("click", function() {
    choisirSymbole("O");
});

// fonction pour gérer le choix du symbole
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