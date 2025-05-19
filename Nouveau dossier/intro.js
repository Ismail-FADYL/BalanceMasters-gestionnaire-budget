function createCoins() {
    const coinsContainer = document.getElementById('flying-coins');
    const coins = ['💰', '💵', '💳', '💸', '💲'];
    
    for (let i = 0; i < 15; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.textContent = coins[Math.floor(Math.random() * coins.length)];
        
        const leftPos = Math.random() * 100;
        const animDuration = 5 + Math.random() * 10;
        const animDelay = Math.random() * 5;
        
        coin.style.left = `${leftPos}%`;
        coin.style.animationDuration = `${animDuration}s`;
        coin.style.animationDelay = `${animDelay}s`;
        
        coinsContainer.appendChild(coin);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    createCoins();

    const authContainer = document.querySelector('.auth-container');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const startBtn = document.getElementById('start-btn');
    const successMessage = document.getElementById('registration-success');

    const users = JSON.parse(localStorage.getItem('users')) || {};

    // Gestion de l'historique
    window.history.pushState(null, document.title, window.location.href);
    window.addEventListener('popstate', function(e) {
        window.history.pushState(null, document.title, window.location.href);
    });

    startBtn.addEventListener('click', () => {
        document.querySelector('.intro-container').style.animation = 'fadeOut 0.5s forwards';
        
        setTimeout(() => {
            authContainer.classList.remove('hidden');
            Object.keys(users).length > 0 ? showLoginForm() : showSignupForm();
        }, 300);
    });

    // Gestion des formulaires
    document.getElementById('registration-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleRegistration();
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleLogin();
    });

    // Navigation entre formulaires
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });

    document.getElementById('show-signup').addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });

    function showLoginForm() {
        signupForm.classList.remove('active');
        loginForm.classList.add('active');
        successMessage.style.display = 'none';
    }

    function showSignupForm() {
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
        successMessage.style.display = 'none';
    }

    function handleRegistration() {
        resetErrors();
        const user = getRegistrationData();
        const errors = validateRegistration(user);

        if (Object.keys(errors).length === 0) {
            if (users[user.cin]) {
                showError('cin-error', 'Ce CIN est déjà enregistré');
                return;
            }
            saveUser(user);
            showLoginAfterRegistration(user.cin);
        } else {
            displayErrors(errors);
        }
    }

    function handleLogin() {
        resetErrors();
        const { cin, password } = getLoginData();
        const user = users[cin];
        const errors = validateLogin(cin, password, user);

        if (Object.keys(errors).length === 0) {
            completeLogin(cin);
        } else {
            displayLoginErrors(errors);
        }
    }

    function validateLogin(cin, password, user) {
        const errors = {};

        if (!user) {
            errors.cin = 'CIN non enregistré';
        } else if (user.password !== password) {
            errors.password = 'Mot de passe incorrect';
        }

        return errors;
    }

    function getRegistrationData() {
        return {
            fullname: document.getElementById('fullname').value.trim(),
            birthdate: document.getElementById('birthdate').value,
            cin: document.getElementById('cin').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };
    }

    function validateRegistration(user) {
        const errors = {};
        const age = calculateAge(new Date(user.birthdate));

        if (!user.fullname) errors.fullname = 'Le nom complet est requis';
        if (!user.birthdate || age < 18) errors.birthdate = 'Vous devez avoir au moins 18 ans';
        if (!/^[A-Za-z0-9]{6,}$/.test(user.cin)) errors.cin = 'CIN invalide (6 caractères minimum)';
        if (user.password.length < 6) errors.password = '6 caractères minimum requis';
        if (user.password !== user.confirmPassword) errors.confirmPassword = 'Les mots de passe ne correspondent pas';

        return errors;
    }

    function saveUser(user) {
        users[user.cin] = {
            fullname: user.fullname,
            birthdate: user.birthdate,
            password: user.password
        };
        localStorage.setItem('users', JSON.stringify(users));
    }

    function showLoginAfterRegistration(cin) {
        showLoginForm();
        document.getElementById('login-cin').value = cin;
        successMessage.style.display = 'block';
        document.getElementById('login-password').focus();
    }

    function completeLogin(cin) {
        localStorage.setItem('currentUser', cin);
        window.location.replace('HTML_Code.html'); // Correction ici
    }

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function displayErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            showError(`${field}-error`, message);
        });
    }

    function displayLoginErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            showError(`login-${field}-error`, message);
        });
    }

    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.style.display = 'block';
    }

    function resetErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
    }

    function getLoginData() {
        return {
            cin: document.getElementById('login-cin').value.trim(),
            password: document.getElementById('login-password').value
        };
    }
});