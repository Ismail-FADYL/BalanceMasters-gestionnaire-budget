/**
 * Crée et affiche des pièces animées sur la page.
 * Cette fonction génère dynamiquement 15 éléments HTML représentant des pièces
 * (utilisant des emojis) avec des positions, durées et délais d'animation aléatoires.
 * @function creerPieces
 * @example
 * creerPieces(); // Affiche 15 pièces animées dans le conteneur 'flying-coins'
 */
function creerPieces() {
    const coinsContainer = document.getElementById('flying-coins'); // Conteneur pour les pièces
    const coins = ['💰', '💵', '💳', '💸', '💲']; // Liste des emojis représentant les pièces

    for (let i = 0; i < 15; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin'; // Applique la classe CSS pour le style
        coin.textContent = coins[Math.floor(Math.random() * coins.length)]; // Sélectionne un emoji aléatoire

        const leftPos = Math.random() * 100; // Position horizontale aléatoire (0-100%)
        const animDuration = 5 + Math.random() * 10; // Durée d'animation entre 5 et 15 secondes
        const animDelay = Math.random() * 5; // Délai d'animation entre 0 et 5 secondes

        coin.style.left = `${leftPos}%`;
        coin.style.animationDuration = `${animDuration}s`;
        coin.style.animationDelay = `${animDelay}s`;

        coinsContainer.appendChild(coin); // Ajoute la pièce au conteneur
    }
}

document.addEventListener('DOMContentLoaded', () => {
    creerPieces();

    const authContainer = document.querySelector('.auth-container'); // Conteneur d'authentification
    const introContainer = document.querySelector('.intro-container'); // Conteneur d'introduction
    const signupForm = document.getElementById('signup-form'); // Formulaire d'inscription
    const loginForm = document.getElementById('login-form'); // Formulaire de connexion
    const startBtn = document.getElementById('start-btn'); // Bouton de démarrage
    const successMessage = document.getElementById('registration-success'); // Message de succès
    const users = JSON.parse(localStorage.getItem('users')) || {}; // Liste des utilisateurs depuis localStorage

    // Initialisation de l'état de l'historique pour la navigation
    window.history.replaceState({ page: 'intro' }, document.title);

    /**
     * Gère les changements d'état de l'historique de navigation.
     * Affiche ou masque les conteneurs d'introduction et d'authentification selon l'état.
     * @param {PopStateEvent} e - L'événement de changement d'état.
     */
    window.addEventListener('popstate', (e) => {
        if (e.state?.page === 'intro') {
            authContainer.classList.add('hidden');
            introContainer.style.display = 'block';
            introContainer.style.animation = 'fadeIn 0.5s forwards';
        } else if (e.state?.page === 'auth') {
            authContainer.classList.remove('hidden');
            introContainer.style.display = 'none';
        }
    });

    /**
     * Lance le processus d'authentification en changeant l'état et affichant le formulaire approprié.
     * Utilise un délai pour une transition fluide avec animation.
     */
    startBtn.addEventListener('click', () => {
        window.history.pushState({ page: 'auth' }, document.title);
        introContainer.style.animation = 'fadeOut 0.5s forwards';

        setTimeout(() => {
            authContainer.classList.remove('hidden');
            // Affiche le formulaire de connexion si des utilisateurs existent, sinon inscription
            Object.keys(users).length > 0 ? afficherFormulaireConnexion() : afficherFormulaireInscription();
        }, 300);
    });

    /**
     * Gère la soumission du formulaire d'inscription.
     * @param {Event} e - L'événement de soumission.
     */
    document.getElementById('registration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        gererInscription();
    });

    /**
     * Gère la soumission du formulaire de connexion.
     * @param {Event} e - L'événement de soumission.
     */
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        gererConnexion();
    });

    /**
     * Affiche le formulaire de connexion lors du clic.
     * @param {Event} e - L'événement de clic.
     */
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        afficherFormulaireConnexion();
    });

    /**
     * Affiche le formulaire d'inscription lors du clic.
     * @param {Event} e - L'événement de clic.
     */
    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        afficherFormulaireInscription();
    });

    /**
     * Affiche le formulaire de connexion et met à jour l'état de l'historique.
     * @function afficherFormulaireConnexion
     */
    function afficherFormulaireConnexion() {
        window.history.replaceState({ page: 'auth', form: 'login' }, document.title);
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        successMessage.style.display = 'none';
    }

    /**
     * Affiche le formulaire d'inscription et met à jour l'état de l'historique.
     * @function afficherFormulaireInscription
     */
    function afficherFormulaireInscription() {
        window.history.replaceState({ page: 'auth', form: 'signup' }, document.title);
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        successMessage.style.display = 'none';
    }

    /**
     * Gère le processus d'inscription en validant les données et en sauvegardant l'utilisateur.
     * @function gererInscription
     * @throws {Error} - Si une erreur de validation ou de sauvegarde survient.
     * @example
     * gererInscription(); // Traite les données du formulaire d'inscription
     */
    function gererInscription() {
        reinitialiserErreurs();
        const user = obtenirDonneesInscription();
        const errors = validerInscription(user);

        if (Object.keys(errors).length === 0) {
            if (users[user.cin]) {
                afficherErreur('cin-error', 'Ce CIN est déjà enregistré');
                return;
            }
            sauvegarderUtilisateur(user);
            afficherConnexionApresInscription(user.cin);
        } else {
            afficherErreurs(errors);
        }
    }

    /**
     * Gère le processus de connexion en validant les identifiants et en finalisant la connexion.
     * @function gererConnexion
     * @example
     * gererConnexion(); // Traite les données du formulaire de connexion
     */
    function gererConnexion() {
        reinitialiserErreurs();
        const { cin, password } = obtenirDonneesConnexion();
        const user = users[cin];
        const errors = validerConnexion(cin, password, user);

        if (Object.keys(errors).length === 0) {
            finaliserConnexion(cin);
        } else {
            afficherErreursConnexion(errors);
        }
    }

    /**
     * Valide les informations de connexion.
     * @function validerConnexion
     * @param {string} cin - Le CIN de l'utilisateur.
     * @param {string} password - Le mot de passe saisi.
     * @param {Object} user - L'utilisateur correspondant dans le stockage.
     * @returns {Object} - Les erreurs détectées, ou un objet vide si aucune erreur.
     */
    function validerConnexion(cin, password, user) {
        const errors = {};

        if (!user) {
            errors.cin = 'CIN non enregistré';
        } else if (user.password !== password) {
            errors.password = 'Mot de passe incorrect';
        }

        return errors;
    }

    /**
     * Récupère les données saisies dans le formulaire d'inscription.
     * @function obtenirDonneesInscription
     * @returns {Object} - Les données de l'utilisateur (nom, date de naissance, CIN, mot de passe).
     */
    function obtenirDonneesInscription() {
        return {
            fullname: document.getElementById('fullname').value.trim(),
            birthdate: document.getElementById('birthdate').value,
            cin: document.getElementById('cin').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };
    }

    /**
     * Valide les données d'inscription.
     * @function validerInscription
     * @param {Object} user - Les données de l'utilisateur.
     * @returns {Object} - Les erreurs détectées, ou un objet vide si aucune erreur.
     */
    function validerInscription(user) {
        const errors = {};
        const age = calculerAge(new Date(user.birthdate));

        if (!user.fullname) errors.fullname = 'Le nom complet est requis';
        if (!user.birthdate || age < 18) errors.birthdate = 'Vous devez avoir au moins 18 ans';
        if (!/^[A-Za-z0-9]{6,}$/.test(user.cin)) errors.cin = 'CIN invalide (6 caractères minimum)';
        if (user.password.length < 6) errors.password = '6 caractères minimum requis';
        if (user.password !== user.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas';

        return errors;
    }

    /**
     * Sauvegarde les données de l'utilisateur dans le localStorage.
     * @function sauvegarderUtilisateur
     * @param {Object} user - Les données de l'utilisateur.
     */
    function sauvegarderUtilisateur(user) {
        users[user.cin] = {
            fullname: user.fullname,
            birthdate: user.birthdate,
            password: user.password
        };
        localStorage.setItem('users', JSON.stringify(users));
    }

    /**
     * Affiche le formulaire de connexion après une inscription réussie.
     * @function afficherConnexionApresInscription
     * @param {string} cin - Le CIN de l'utilisateur.
     */
    function afficherConnexionApresInscription(cin) {
        afficherFormulaireConnexion();
        document.getElementById('login-cin').value = cin;
        successMessage.style.display = 'block';
        document.getElementById('login-password').focus();
    }

    /**
     * Finalise la connexion et redirige vers la page principale.
     * @function finaliserConnexion
     * @param {string} cin - Le CIN de l'utilisateur.
     */
    function finaliserConnexion(cin) {
        localStorage.setItem('currentUser', cin);
        window.history.replaceState({}, document.title);
        window.location.href = 'HTML_Code.html';
    }

    /**
     * Calcule l'âge à partir de la date de naissance.
     * @function calculerAge
     * @param {Date} birthDate - La date de naissance.
     * @returns {number} - L'âge de l'utilisateur.
     */
    function calculerAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    /**
     * Affiche les erreurs de validation pour l'inscription.
     * @function afficherErreurs
     * @param {Object} errors - Les erreurs à afficher.
     */
    function afficherErreurs(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            afficherErreur(`${field}-error`, message);
        });
    }

    /**
     * Affiche les erreurs de validation pour la connexion.
     * @function afficherErreursConnexion
     * @param {Object} errors - Les erreurs à afficher.
     */
    function afficherErreursConnexion(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            afficherErreur(`login-${field}-error`, message);
        });
    }

    /**
     * Affiche un message d'erreur dans un élément spécifique.
     * @function afficherErreur
     * @param {string} elementId - L'ID de l'élément où afficher l'erreur.
     * @param {string} message - Le message d'erreur.
     */
    function afficherErreur(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.style.display = 'block';
    }

    /**
     * Réinitialise les messages d'erreur affichés.
     * @function reinitialiserErreurs 
     */
    function reinitialiserErreurs() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Récupère les données saisies dans le formulaire de connexion.
     * @function obtenirDonneesConnexion
     * @returns {Object} - Les données de connexion (CIN, mot de passe).
     */
    function obtenirDonneesConnexion() {
        return {
            cin: document.getElementById('login-cin').value.trim(),
            password: document.getElementById('login-password').value
        };
    }

    /**
     * Redirige vers la page principale en mode invité.
     * @listens click - Événement déclenché par le bouton 'guest-btn'.
     */
    document.getElementById("guest-btn").addEventListener("click", function () {
        window.location.href = "HTML_Code.html";
    });
});