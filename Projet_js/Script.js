const typeInput = document.getElementById('type');
const montantInput = document.getElementById('montant');
const dateInput = document.getElementById('date');
const ajouterTransactionBtn = document.getElementById('ajouterTransaction');
const transactionsList = document.getElementById('transactions');
const soldeDisplay = document.getElementById('solde');
const messageDisplay = document.getElementById('message');
const ctx = document.getElementById('myChart');

// Éléments pour l'affichage mensuel
const monthlyTransactionsList = document.getElementById('monthly-transactions');
const monthlyRevenuesDisplay = document.getElementById('monthly-revenues');
const monthlyExpensesDisplay = document.getElementById('monthly-expenses');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart = null;

function mettreAJourSolde() {
    let totalRevenus = 0;
    let totalDepenses = 0;
    const transactionsParDate = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        if (!transactionsParDate[date]) {
            transactionsParDate[date] = { revenus: 0, depenses: 0 };
        }

        if (transaction.type === 'revenu') {
            totalRevenus += parseFloat(transaction.montant);
            transactionsParDate[date].revenus += parseFloat(transaction.montant);
        } else {
            // Stockage des dépenses en valeurs négatives
            totalDepenses += parseFloat(transaction.montant);
            transactionsParDate[date].depenses -= parseFloat(transaction.montant);
        }
    });

    const solde = totalRevenus - totalDepenses;
    soldeDisplay.textContent = solde.toFixed(2) + ' €';
    soldeDisplay.className = solde >= 0 ? 'revenu' : 'depense';

    mettreAJourGraphique(transactionsParDate);
}

function mettreAJourGraphique(transactionsParDate) {
    const dates = Object.keys(transactionsParDate).sort((a, b) => new Date(a) - new Date(b));
    
    const config = {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Revenus',
                data: dates.map(date => transactionsParDate[date].revenus),
                borderColor: '#4BC0C0',
                tension: 0.4,
                yAxisID: 'y'
            }, {
                label: 'Dépenses',
                data: dates.map(date => transactionsParDate[date].depenses),
                borderColor: '#FF6384',
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Évolution financière'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenus (€)'
                    },
                    beginAtZero: false
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Dépenses (€)'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    beginAtZero: false
                }
            }
        }
    };

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, config);
}

function afficherTransactions() {
    transactionsList.innerHTML = '';
    transactions.forEach((transaction, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="transaction-details">
                <span class="${transaction.type}">${transaction.type === 'revenu' ? '+' : '-'} ${parseFloat(transaction.montant).toFixed(2)} €</span>
                - ${transaction.type} (${new Date(transaction.date).toLocaleDateString()})
            </div>
            <div class="transaction-actions">
                <button class="modifier-btn" data-index="${index}">Modifier</button>
                <button class="supprimer-btn" data-index="${index}">Supprimer</button>
            </div>
        `;
        transactionsList.appendChild(listItem);
    });

    document.querySelectorAll('.supprimer-btn').forEach(button => {
        button.addEventListener('click', supprimerTransaction);
    });
    document.querySelectorAll('.modifier-btn').forEach(button => {
        button.addEventListener('click', modifierTransaction);
    });
}

function afficherTransactionsMensuelles() {
    monthlyTransactionsList.innerHTML = '';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthlyTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth;
    });

    monthlyTransactions.forEach(transaction => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="${transaction.type}">${transaction.type === 'revenu' ? '+' : '-'} ${parseFloat(transaction.montant).toFixed(2)} €</span>
            - ${transaction.type} (${new Date(transaction.date).toLocaleDateString()})
        `;
        monthlyTransactionsList.appendChild(listItem);
    });

    mettreAJourRecapitulatifMensuel(monthlyTransactions);
}

function mettreAJourRecapitulatifMensuel(monthlyTransactions) {
    let totalRevenus = 0;
    let totalDepenses = 0;

    monthlyTransactions.forEach(transaction => {
        if (transaction.type === 'revenu') {
            totalRevenus += parseFloat(transaction.montant);
        } else if (transaction.type === 'depense') {
            totalDepenses += parseFloat(transaction.montant);
        }
    });

    monthlyRevenuesDisplay.textContent = totalRevenus.toFixed(2);
    monthlyExpensesDisplay.textContent = totalDepenses.toFixed(2);
}

function ajouterNouvelleTransaction() {
    const type = typeInput.value;
    const montant = parseFloat(montantInput.value);
    const date = dateInput.value;

    if (isNaN(montant) || date === '') {
        messageDisplay.textContent = 'Veuillez remplir tous les champs correctement.';
        messageDisplay.style.color = 'red';
        return;
    }

    const nouvelleTransaction = { type, montant, date };
    transactions.push(nouvelleTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    messageDisplay.textContent = 'Transaction ajoutée.';
    messageDisplay.style.color = 'green';

    typeInput.value = 'revenu';
    montantInput.value = '';
    dateInput.value = '';

    initialiserEtAfficher();
}

function supprimerTransaction(event) {
    const indexASupprimer = parseInt(event.target.dataset.index);
    transactions.splice(indexASupprimer, 1);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    initialiserEtAfficher();
}

function modifierTransaction(event) {
    const indexAModifier = parseInt(event.target.dataset.index);
    const transactionAModifier = transactions[indexAModifier];

    const nouveauMontant = parseFloat(prompt("Nouveau montant :", transactionAModifier.montant));
    const nouveauType = prompt("Nouveau type (revenu/depense) :", transactionAModifier.type);
    const nouvelleDate = prompt("Nouvelle date (YYYY-MM-DD) :", transactionAModifier.date);

    if (!isNaN(nouveauMontant) && nouveauType !== null && nouvelleDate !== null) {
        transactions[indexAModifier].montant = nouveauMontant;
        transactions[indexAModifier].type = nouveauType.toLowerCase().trim();
        transactions[indexAModifier].date = nouvelleDate;
        localStorage.setItem('transactions', JSON.stringify(transactions));
        initialiserEtAfficher();
        messageDisplay.textContent = 'Transaction modifiée.';
        messageDisplay.style.color = 'blue';
    } else {
        messageDisplay.textContent = 'Modification annulée ou données invalides.';
        messageDisplay.style.color = 'orange';
    }
}

function initialiserEtAfficher() {
    mettreAJourSolde();
    afficherTransactions();
    afficherTransactionsMensuelles();
}

ajouterTransactionBtn.addEventListener('click', ajouterNouvelleTransaction);

// Initialisation
initialiserEtAfficher();