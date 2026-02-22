async function init() {
    const libraryView = document.getElementById('library-view');
    const playerView = document.getElementById('player-view');
    const gameFrame = document.getElementById('game-frame');
    const gameTitle = document.getElementById('current-game-title');
    const gameDesc = document.getElementById('current-game-desc');
    const backBtn = document.getElementById('back-btn');
    const logo = document.getElementById('site-logo');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    try {
        const response = await fetch(`./games.json?t=${Date.now()}`);
        const games = await response.json();

        function showLibrary() {
            libraryView.classList.remove('hidden');
            playerView.classList.add('hidden');
            backBtn.classList.add('hidden');
            gameFrame.src = '';
            document.title = 'Arcade Hub';
        }

        function play(game) {
            libraryView.classList.add('hidden');
            playerView.classList.remove('hidden');
            backBtn.classList.remove('hidden');
            gameTitle.textContent = game.title;
            gameDesc.textContent = game.description;
            document.title = `${game.title} | Arcade Hub`;
            
            // Set permissions for better game compatibility
            gameFrame.setAttribute('allow', 'accelerometer *; ambient-light-sensor *; autoplay *; camera *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *; geolocation *; gyroscope *; local-network-access *; magnetometer *; microphone *; midi *; payment *; picture-in-picture *; screen-wake-lock *; speaker *; sync-xhr *; usb *; vibrate *; vr *; web-share *; pointer-lock *');
            gameFrame.setAttribute('sandbox', 'allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-storage-access-by-user-activation allow-pointer-lock');
            
            gameFrame.src = game.url;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        fullscreenBtn.onclick = async () => {
            try {
                if (gameFrame.requestFullscreen) {
                    await gameFrame.requestFullscreen();
                } else if (gameFrame.webkitRequestFullscreen) { /* Safari */
                    await gameFrame.webkitRequestFullscreen();
                } else if (gameFrame.msRequestFullscreen) { /* IE11 */
                    await gameFrame.msRequestFullscreen();
                }
                
                // Request pointer lock after entering fullscreen
                // We use a slight timeout to ensure the fullscreen transition has started
                setTimeout(() => {
                    if (gameFrame.requestPointerLock) {
                        gameFrame.requestPointerLock();
                    }
                }, 100);
            } catch (err) {
                console.error("Error attempting to enable full-screen or pointer lock:", err);
            }
        };

        // Also handle pointer lock when clicking inside the frame while in fullscreen
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement === gameFrame) {
                gameFrame.onclick = () => {
                    if (gameFrame.requestPointerLock) {
                        gameFrame.requestPointerLock();
                    }
                };
            } else {
                gameFrame.onclick = null;
            }
        });

        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card glass p-5 rounded-[2rem] cursor-pointer group';
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-2xl mb-5">
                    <img src="${game.thumbnail}" class="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-110" referrerpolicy="no-referrer">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span class="text-white text-xs font-bold uppercase tracking-widest">Play Now</span>
                    </div>
                </div>
                <h3 class="text-xl font-bold tracking-tight">${game.title}</h3>
                <p class="text-zinc-500 text-sm mt-2 line-clamp-2 leading-relaxed">${game.description}</p>
            `;
            card.onclick = () => play(game);
            libraryView.appendChild(card);
        });

        backBtn.onclick = showLibrary;
        logo.onclick = showLibrary;

    } catch (error) {
        console.error('Error loading games:', error);
    }
}

init();
