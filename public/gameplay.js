const statut = document.querySelector("h2")
let jeuActif = true
let joueurActif = "X"
let etatJeu = ["", "", "", "", "", "", "", "", ""]
var boutonChoixSymbole = document.createElement("BUTTON");
var texteBoutonSymbole = document.createTextNode("Choisir X ou O");

// On définit les conditions de victoire
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

// Messages
const gagne = () => `Le joueur ${joueurActif} a gagné`
const egalite = () => "Egalité"
const tourJoueur = () => `C'est au tour du joueur ${joueurActif}`

// On affiche quel joueur commence
statut.innerHTML = tourJoueur();

// On met en place les écouteurs d'évènements
document.querySelectorAll(".griditem").forEach(cell => cell.addEventListener("click", gestionClicgrid))

/**
 * Cette fonction gère le clic sur les cases du jeu
 */
function gestionClicgrid(){
    // On récupère l'index de la case cliquée
    const indexgrid = parseInt(this.dataset.index)
   
    // On vérifie si la case est déjà remplie ou le jeu terminé
    if(etatJeu[indexgrid] !== "" || !jeuActif){
        return
    }

    // On écrit le symbole du joueur dans le tableau etatJeu et la case
    etatJeu[indexgrid] = joueurActif
    this.innerHTML = joueurActif
    verifGagne()
}

/**
 * Cette fonction vérifie si le joueur a gagné
 */
function verifGagne(){
    let tourGagnant = false

    // On parcourt toutes les conditions de victoire
    for(let conditionVictoire of conditionsVictoire){
        // On récupère les 3 cases de la condition de victoire
        let val1 = etatJeu[conditionVictoire[0]]
        let val2 = etatJeu[conditionVictoire[1]]
        let val3 = etatJeu[conditionVictoire[2]]

        // Si l'une des cases est vide
        if(val1 === "" || val2 === "" || val3 === ""){
            continue
        }

        // Si les 3 cases sont identiques
        if(val1 === val2 && val2 === val3){
            // On gagne
            tourGagnant = true
            break
        }
    }

    // Si on a gagné
    if(tourGagnant){
        statut.innerHTML = gagne()
        jeuActif = false
        var boutonRecommencer = document.createElement("BUTTON");
        var texteBouton = document.createTextNode("Recommencer");
        boutonRecommencer.appendChild(texteBouton);
        document.body.appendChild(boutonRecommencer);
        
        // Ajout d'un gestionnaire d'événements au bouton
        boutonRecommencer.addEventListener("click", recommencer);
        return
    }

    // Si toutes les cases sont remplies
    if(!etatJeu.includes("")){
        statut.innerHTML = egalite()
        jeuActif = false
        var boutonRecommencer = document.createElement("BUTTON");
        var texteBouton = document.createTextNode("Recommencer");
        boutonRecommencer.appendChild(texteBouton);
        document.body.appendChild(boutonRecommencer);

// Ajout d'un gestionnaire d'événements au bouton
        boutonRecommencer.addEventListener("click", recommencer);
        return
    }

    // On change de joueur
    joueurActif = joueurActif === "X" ? "O" : "X"
    statut.innerHTML = tourJoueur()
}

/**
 * Cette fonction réinitialise le jeu
 */
function recommencer(){
    window.location.reload();


}

boutonChoixSymbole.appendChild(texteBoutonSymbole);
document.body.appendChild(boutonChoixSymbole);

// Ajout d'un gestionnaire d'événements au bouton de choix de symbole
boutonChoixSymbole.addEventListener("click", choisirSymbole);

// Fonction pour gérer le choix du symbole
function choisirSymbole() {
    // Demander au joueur de choisir entre X et O
    var choixSymbole = prompt("Choisissez X ou O pour le premier joueur:");

    // Vérifier si le choix est valide
    if (choixSymbole && (choixSymbole.toUpperCase() === "X" || choixSymbole.toUpperCase() === "O")) {
        joueurActif = choixSymbole.toUpperCase();
        statut.innerHTML = tourJoueur();
        boutonChoixSymbole.style.display = "none"; // Cacher le bouton après le choix
    } else {
        alert("Choix invalide. Veuillez choisir X ou O.");
    }
}
