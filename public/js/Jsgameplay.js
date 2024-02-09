const statut = document.querySelector("h2")
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
const egalite = () => "Egalité"
const tourJoueur = () => `C'est au tour du joueur ${joueurActif}`

// On affiche quel joueur commence
statut.innerHTML = tourJoueur()

// On met en place les écouteurs d'évènements
document.querySelectorAll("td[data-index]").forEach(cell => cell.addEventListener("click", gestionClicgrid));

// Convertit les symboles en 1 ou 2 pour l'envoie MQTT
const playerSymbole = {
    "X": 0,
    "O": 1
}

// gère le clic sur les cases du jeu
function gestionClicgrid() {
    // On récupère l'index de la case cliquée
    
    const indexgrid = parseInt(this.dataset.index);
    var convertionSymbole = playerSymbole[joueurActif];

    // Désactive les boutons pour changer de symbole quand on clique une case sur la grille
    document.querySelector(".croix1").disabled = true;
    document.querySelector(".rond1").disabled = true;

    // On vérifie si la case est déjà remplie ou le jeu terminé
    if (etatJeu[indexgrid] !== "" || !jeuActif) {
        return;
    }

    // On crée un élément img avec la source de l'image
    const imgElement = document.createElement("img");

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

    // On écrit le symbole du joueur dans le tableau etatJeu
    etatJeu[indexgrid] = joueurActif;
    console.log(`${indexgrid}.${convertionSymbole}`);

    verifGagne();
}

// vérifie si le joueur a gagné
function verifGagne(){
    let tourGagnant = false

    // les conditions de victoire
    for(let conditionVictoire of conditionsVictoire){
        // On récupère les 3 cases de la condition de victoire
        let val1 = etatJeu[conditionVictoire[0]]
        let val2 = etatJeu[conditionVictoire[1]]
        let val3 = etatJeu[conditionVictoire[2]]

        // si l'une des cases est vide
        if(val1 === "" || val2 === "" || val3 === ""){
            continue
        }

        // si les 3 cases sont identiques
        if(val1 === val2 && val2 === val3){
            // on gagne
            tourGagnant = true
            break
        }
    }

    // si on a gagné
    if(tourGagnant){
        statut.innerHTML = gagne()
        jeuActif = false
        console.log(playerSymbole[joueurActif], 'win')
        // Ajout d'un gestionnaire d'événements au bouton
        document.querySelector(".restart").addEventListener("click", recommencer);
        
        return
    }

    // si toutes les cases sont remplies
    if(!etatJeu.includes("")){
        statut.innerHTML = egalite()
        jeuActif = false
        console.log(playerSymbole[joueurActif], 'egalité')
        //setTimeout(ti, 1000)
        // ajout d'un gestionnaire d'événements au bouton
        document.querySelector(".restart").addEventListener("click", recommencer);
        return
    }

    // change de joueur
    joueurActif = joueurActif === "X" ? "O" : "X"
    statut.innerHTML = tourJoueur()
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