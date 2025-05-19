 document.addEventListener('DOMContentLoaded', function() {
            const typeInput = document.getElementById('type');
            const montantInput = document.getElementById('montant');
            const dateInput = document.getElementById('date');
            const ajouterTransactionBtn = document.getElementById('ajouterTransaction');
            const messageDiv = document.getElementById('message');
            const soldeSpan = document.getElementById('solde');
            const transactionsList = document.getElementById('transactions-list');
            const monthlyRevenuesSpan = document.getElementById('monthly-revenues');
            const monthlyExpensesSpan = document.getElementById('monthly-expenses');
            const chartCanvas = document.getElementById('myChart');
            const chartCtx = chartCanvas.getContext('2d');
            const navLinks = document.querySelectorAll('.nav-link');
            const contentSections = document.querySelectorAll('.main-content > div.card');
            const inputSection = document.querySelector('.input-section');

            let transactions = [];
            let myChart;
            let editingIndex = -1;

            function showFeedback(message, color) {
                messageDiv.textContent = message;
                messageDiv.className = `message ${color}`; // Ajout de la classe pour le style
                messageDiv.style.display = 'block';
                setTimeout(() => messageDiv.style.display = 'none', 3000);
            }

            function updateSolde() {
                const total = transactions.reduce((acc, t) =>
                    t.type === 'revenu' ? acc + parseFloat(t.montant) : acc - parseFloat(t.montant), 0);
                soldeSpan.textContent = total.toFixed(2) + ' DH';
            }

            function updateMonthlySummary() {
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const monthly = transactions.reduce((acc, t) => {
                    const date = new Date(t.date);
                    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                        t.type === 'revenu'
                            ? acc.revenus += parseFloat(t.montant)
                            : acc.depenses += parseFloat(t.montant);
                    }
                    return acc;
                }, { revenus: 0, depenses: 0 });

                monthlyRevenuesSpan.textContent = monthly.revenus.toFixed(2);
                monthlyExpensesSpan.textContent = monthly.depenses.toFixed(2);
            }

            function renderTransactions() {
                transactionsList.innerHTML = '';
                transactions.forEach((t, index) => {
                    const li = document.createElement('li');
                    li.className = t.type === 'depense' ? 'depense' : 'revenu';
                    if(index === editingIndex) li.classList.add('editing');
                    li.innerHTML = `
                        <div class="transaction-info">
                            <span>${t.type.charAt(0).toUpperCase() + t.type.slice(1)}</span>
                            <span>${parseFloat(t.montant).toFixed(2)} DH</span>
                            <span>${new Date(t.date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <div class="transaction-actions">
                            <button class="btn-action btn-edit" data-index="${index}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-action btn-delete" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    transactionsList.appendChild(li);
                });

                document.querySelectorAll('.btn-delete').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const index = parseInt(this.dataset.index);
                        transactions.splice(index, 1);
                        showFeedback('Transaction supprimée', 'danger');
                        updateAll();
                    });
                });

                document.querySelectorAll('.btn-edit').forEach(btn => {
                    btn.addEventListener('click', function() {
                        editingIndex = parseInt(this.dataset.index);
                        const t = transactions[editingIndex];
                        typeInput.value = t.type;
                        montantInput.value = t.montant;
                        dateInput.value = t.date;
                        // inputSection.classList.add('edit-mode');
                        showFeedback('Mode édition activé', 'success');
                    });
                });
            }

            function updateChart() {
                if (myChart) myChart.destroy();

                const transactionsParDate = transactions.reduce((acc, t) => {
                    const date = new Date(t.date).toISOString().split('T')[0];
                    if (!acc[date]) {
                        acc[date] = { revenus: 0, depenses: 0 };
                    }
                    
                    t.type === 'revenu' 
                        ? acc[date].revenus += parseFloat(t.montant)
                        : acc[date].depenses += parseFloat(t.montant);
                    
                    return acc;
                }, {});

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
                        maintainAspectRatio: false,
                        interaction: {
                            mode: 'index',
                            intersect: false,
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: 'Évolution financière',
                                font: {
                                    size: 16,
                                    family: 'Poppins'
                                }
                            }
                        },
                        scales: {
                            y: {
                                type: 'linear',
                                display: true,
                                position: 'left',
                                title: {
                                    display: true,
                                    text: 'Revenus (DH)'
                                },
                                beginAtZero: false
                            },
                            y1: {
                                type: 'linear',
                                display: true,
                                position: 'right',
                                title: {
                                    display: true,
                                    text: 'Dépenses (DH)'
                                },
                                grid: {
                                    drawOnChartArea: false
                                },
                                beginAtZero: false
                            }
                        }
                    }
                };

                myChart = new Chart(chartCtx, config);
            }

            function updateAll() {
                updateSolde();
                updateMonthlySummary();
                renderTransactions();
                updateChart();
                localStorage.setItem('transactions', JSON.stringify(transactions));
            }

            ajouterTransactionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const type = typeInput.value;
                const montant = parseFloat(montantInput.value);
                const date = dateInput.value;

                if (!type || isNaN(montant) || montant <= 0 || !date) {
                    showFeedback('Veuillez remplir tous les champs', 'danger');
                    return;
                }

                if (editingIndex > -1) {
                    transactions[editingIndex] = { type, montant: montant.toFixed(2), date };
                    showFeedback('Transaction modifiée', 'success');
                    editingIndex = -1;
                    // inputSection.classList.remove('edit-mode');
                } else {
                    transactions.push({ type, montant: montant.toFixed(2), date });
                    showFeedback('Transaction ajoutée', 'success');
                }

                montantInput.value = '';
                dateInput.value = new Date().toISOString().split('T')[0];
                updateAll();
            });

            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    navLinks.forEach(nl => nl.classList.remove('active'));
                    this.classList.add('active');
                    const section = this.dataset.section;
                    contentSections.forEach(s => s.classList.add('hidden'));
                    document.getElementById(section).classList.remove('hidden');
                    inputSection.classList.remove('hidden');
                    localStorage.setItem('activeSection', section);
                });
            });

            // Initialisation
            const savedTransactions = localStorage.getItem('transactions');
            if (savedTransactions) transactions = JSON.parse(savedTransactions);
            dateInput.value = new Date().toISOString().split('T')[0];
            updateAll();
            const activeSection = localStorage.getItem('activeSection') || 'overview';
            document.querySelector(`[data-section="${activeSection}"]`).click();
        });