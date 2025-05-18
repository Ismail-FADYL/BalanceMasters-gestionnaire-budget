        // Create flying coins animation
        function createCoins() {
            const coinsContainer = document.getElementById('flying-coins');
            const coins = ['💰', '💵', '💳', '💸', '💲'];
            
            for (let i = 0; i < 15; i++) {
                const coin = document.createElement('div');
                coin.className = 'coin';
                coin.textContent = coins[Math.floor(Math.random() * coins.length)];
                
                // Random position and animation duration
                const leftPos = Math.random() * 100;
                const animDuration = 5 + Math.random() * 10;
                const animDelay = Math.random() * 5;
                
                coin.style.left = `${leftPos}%`;
                coin.style.animationDuration = `${animDuration}s`;
                coin.style.animationDelay = `${animDelay}s`;
                
                coinsContainer.appendChild(coin);
            }
        }
        
        // Start the animation when page loads
        window.onload = function() {
            createCoins();
            
            // Button click event
            document.getElementById('start-btn').addEventListener('click', function() {
                // Add a fade-out animation before redirecting
                document.querySelector('.intro-container').style.animation = 'fadeIn 0.5s reverse forwards';
                
                // Redirect after animation completes
                setTimeout(function() {
                    window.location.href = 'HTML_Code.html'; // Your budget manager page
                }, 500);
            });
        };