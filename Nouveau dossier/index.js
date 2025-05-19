const sampleTransactions = [
{
         id: 1,
         type: 'income',
         amount: 1200,
         category: 'Salaire',
         date: '2023-06-15',
         description: 'Salaire mensuel'
},
{
         id: 2,
         type: 'expense',
         amount: 45.50,
         category: 'Épicerie',
         date: '2023-06-16',
         description: 'Courses hebdomadaires'
},
{
         id: 3,
         type: 'expense',
         amount: 89.99,
         category: 'Loisirs',
         date: '2023-06-18',
         description: 'Cinéma et dîner'
},
{
         id: 4,
         type: 'income',
         amount: 250,
         category: 'Freelance',
         date: '2023-06-20',
         description: 'Projet de design'
},
{
         id: 5,
         type: 'expense',
         amount: 32.40,
         category: 'Transport',
         date: '2023-06-21',
         description: 'Essence'
}
];

const categories = {
         income: ['Salaire', 'Freelance', 'Investissements', 'Cadeaux', 'Autres revenus'],
         expense: ['Logement', 'Épicerie', 'Transport', 'Loisirs', 'Santé', 'Éducation', 'Autres dépenses']
};

// DOM Elements
const transactionsList = document.getElementById('transactions');
const incomeTransactionsList = document.getElementById('income-transactions');
const expenseTransactionsList = document.getElementById('expense-transactions');
const transactionTypeSelect = document.getElementById('transactionType');
const transactionCategorySelect = document.getElementById('transactionCategory');
const transactionForm = document.getElementById('transactionForm');
const addTransactionBtn = document.getElementById('addTransactionBtn');
const modal = document.getElementById('addTransactionModal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the app
function init() {
         renderTransactions();
         setupEventListeners();
         initCharts();
}

// Render transactions
function renderTransactions() {
         transactionsList.innerHTML = '';
         incomeTransactionsList.innerHTML = '';
         expenseTransactionsList.innerHTML = '';

         sampleTransactions.forEach(transaction => {
         const transactionElement = createTransactionElement(transaction);
         transactionsList.appendChild(transactionElement);

         if (transaction.type === 'income') {
                  incomeTransactionsList.appendChild(transactionElement.cloneNode(true));
         } else {
                  expenseTransactionsList.appendChild(transactionElement.cloneNode(true));
         }
         });
}

// Create transaction element
function createTransactionElement(transaction) {
         const li = document.createElement('li');
         li.className = 'transaction-item';
         
         const iconClass = transaction.type === 'income' ? 'income' : 'expense';
         const icon = transaction.type === 'income' ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
         const amountClass = transaction.type === 'income' ? 'income' : 'expense';
         
         li.innerHTML = `
         <div class="transaction-info">
                  <div class="transaction-icon ${iconClass}">
                  <i class="${icon}"></i>
                  </div>
                  <div class="transaction-details">
                  <div class="transaction-title">${transaction.category}</div>
                  <div class="transaction-date">${formatDate(transaction.date)}</div>
                  <div class="badge ${iconClass === 'income' ? 'badge-success' : 'badge-danger'}">${transaction.category}</div>
                  </div>
         </div>
         <div class="transaction-amount ${amountClass}">${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} €</div>
         `;
         
         return li;
}

// Format date
function formatDate(dateString) {
         const options = { day: 'numeric', month: 'short', year: 'numeric' };
         return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Setup event listeners
function setupEventListeners() {
         // Transaction type change
         transactionTypeSelect.addEventListener('change', function() {
         updateCategories(this.value);
         });

         // Form submission
         transactionForm.addEventListener('submit', function(e) {
         e.preventDefault();
         // Here you would normally save the transaction
         alert('Transaction enregistrée!');
         closeModal();
         });

         // Add transaction button
         addTransactionBtn.addEventListener('click', openModal);

         // Close modal buttons
         closeModalButtons.forEach(button => {
         button.addEventListener('click', closeModal);
         });

         // Tab switching
         tabs.forEach(tab => {
         tab.addEventListener('click', function() {
                  const tabId = this.getAttribute('data-tab');
                  switchTab(tabId);
         });
         });
}

// Update categories based on transaction type
function updateCategories(type) {
         transactionCategorySelect.innerHTML = '<option value="">Sélectionner une catégorie</option>';
         
         if (!type) return;
         
         const typeCategories = categories[type];
         typeCategories.forEach(category => {
         const option = document.createElement('option');
         option.value = category;
         option.textContent = category;
         transactionCategorySelect.appendChild(option);
         });
}

// Open modal
function openModal() {
         modal.style.display = 'block';
         document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
         modal.style.display = 'none';
         document.body.style.overflow = 'auto';
}

// Switch tabs
function switchTab(tabId) {
         tabs.forEach(tab => {
         if (tab.getAttribute('data-tab') === tabId) {
                  tab.classList.add('active');
         } else {
                  tab.classList.remove('active');
         }
         });

         tabContents.forEach(content => {
         if (content.id === `tab-${tabId}`) {
                  content.classList.add('active');
         } else {
                  content.classList.remove('active');
         }
         });
}

// Initialize charts
function initCharts() {
         // Financial Chart
         const financialCtx = document.getElementById('financialChart').getContext('2d');
         const financialChart = new Chart(financialCtx, {
         type: 'bar',
         data: {
                  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
                  datasets: [
                  {
                           label: 'Revenus',
                           data: [1200, 1900, 1500, 2000, 1800, 2100],
                           backgroundColor: '#4cc9f0',
                           borderRadius: 4
                  },
                  {
                           label: 'Dépenses',
                           data: [800, 1200, 1000, 1100, 900, 1300],
                           backgroundColor: '#f72585',
                           borderRadius: 4
                  }
                  ]
         },
         options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                  legend: {
                           position: 'top',
                  },
                  tooltip: {
                           callbacks: {
                           label: function(context) {
                           return context.dataset.label + ': ' + context.raw + ' €';
                           }
                           }
                  }
                  },
                  scales: {
                  x: {
                           grid: {
                           display: false
                           }
                  },
                  y: {
                           beginAtZero: true,
                           ticks: {
                           callback: function(value) {
                           return value + ' €';
                           }
                           }
                  }
                  }
         }
         });
}
    // Données des lieux (initialisées depuis localStorage)
    let places = JSON.parse(localStorage.getItem('mountainPlaces')) || [];
    let map;

    // Éléments DOM
    const placesSection = document.getElementById('placesSection');
    const placesTab = document.getElementById('placesTab');
    const placesContainer = document.getElementById('placesContainer');
    const addPlaceBtn = document.getElementById('addPlaceBtn');
    const addPlaceModal = document.getElementById('addPlaceModal');
    const placeForm = document.getElementById('placeForm');
 placesTab.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.main-content > .card').forEach(card => {
            card.style.display = 'none';
        });
        placesSection.style.display = 'block';
        initMap();
        renderPlaces();
    });

    // Ouvrir le modal d'ajout
    addPlaceBtn.addEventListener('click', function() {
        addPlaceModal.style.display = 'flex';
    });

    // Fermer le modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            addPlaceModal.style.display = 'none';
        });
    });

    // Enregistrer un nouveau lieu
    placeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPlace = {
            id: Date.now(),
            name: document.getElementById('placeName').value,
            altitude: document.getElementById('placeAltitude').value,
            location: document.getElementById('placeLocation').value,
            image: document.getElementById('placeImage').value || 'https://source.unsplash.com/random/600x400/?mountain',
            date: new Date().toISOString()
        };
        
        places.push(newPlace);
        savePlaces();
        renderPlaces();
        addPlaceModal.style.display = 'none';
        placeForm.reset();
    });

    // Sauvegarder dans localStorage
    function savePlaces() {
        localStorage.setItem('mountainPlaces', JSON.stringify(places));
    }

    // Afficher les lieux
    function renderPlaces() {
        placesContainer.innerHTML = '';
        
        if (places.length === 0) {
            placesContainer.innerHTML = '<p>Aucune montagne enregistrée. Ajoutez-en une !</p>';
            return;
        }
        
        places.forEach(place => {
            const [lat, lng] = place.location.split(',').map(coord => parseFloat(coord.trim()));
            
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';
            placeCard.innerHTML = `
                <div class="place-image" style="background-image: url('${place.image}')">
                    <div class="place-badge">${place.altitude}m</div>
                </div>
                <div class="place-details">
                    <h3 class="place-title">${place.name}</h3>
                    <div class="place-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${place.location}
                    </div>
                    <div class="place-actions">
                        <button class="btn btn-outline" onclick="focusOnMap(${lat}, ${lng})">
                            <i class="fas fa-map"></i> Voir
                        </button>
                        <button class="btn btn-outline" onclick="deletePlace(${place.id})">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            `;
            
            placesContainer.appendChild(placeCard);
        });
        
        updateMapMarkers();
    }

    // Initialiser la carte
    function initMap() {
        if (map) return;
        
        map = L.map('map').setView([45.833, 6.865], 10); // Position par défaut (Mont Blanc)
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        
        updateMapMarkers();
    }

    // Mettre à jour les marqueurs sur la carte
    function updateMapMarkers() {
        if (!map) return;
        
        // Supprimer les anciens marqueurs
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });
        
        // Ajouter les nouveaux marqueurs
        places.forEach(place => {
            const [lat, lng] = place.location.split(',').map(coord => parseFloat(coord.trim()));
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`<b>${place.name}</b><br>Altitude: ${place.altitude}m`);
        });
    }

    // Centrer la carte sur un lieu
    window.focusOnMap = function(lat, lng) {
        if (map) {
            map.setView([lat, lng], 13);
        }
    };

    // Supprimer un lieu
    window.deletePlace = function(id) {
        if (confirm('Supprimer ce lieu ?')) {
            places = places.filter(place => place.id !== id);
            savePlaces();
            renderPlaces();
        }
    };

    // Exemple de données initiales (optionnel)
    if (places.length === 0) {
        places = [
            {
                id: 1,
                name: "Mont Blanc",
                altitude: 4808,
                location: "45.8326, 6.8652",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Mont_Blanc_oct_2004.JPG/800px-Mont_Blanc_oct_2004.JPG",
                date: new Date().toISOString()
            },
            {
                id: 2,
                name: "Mont Everest",
                altitude: 8848,
                location: "27.9881, 86.9250",
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Everest_kalapatthar.jpg/800px-Everest_kalapatthar.jpg",
                date: new Date().toISOString()
            }
        ];
        savePlaces();
    }
// Initialize the application
document.addEventListener('DOMContentLoaded', init);
