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
        if (!response.ok) throw new Error(`Failed to load games: ${response.statusText}`);
        const games = await response.json();

        function showLibrary() {
            libraryView.classList.remove('hidden');
            playerView.classList.add('hidden');
            backBtn.classList.add('hidden');
            gameFrame.src = '';
            document.title = 'Arcade Hub';
        }

        function play(game) {
            if (game.type === 'about-blank') {
                try {
                    const blob = new Blob([`
                        <!DOCTYPE html>
                        <html style="margin:0;padding:0;height:100%;overflow:hidden;">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>${game.title}</title>
                            <style>
                                body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; background: #000; }
                                iframe { border: none; width: 100%; height: 100%; position: fixed; top: 0; left: 0; }
                            </style>
                        </head>
                        <body>
                            <iframe src="${game.url}"></iframe>
                        </body>
                        </html>
                    `], { type: 'text/html' });
                    
                    const blobUrl = URL.createObjectURL(blob);
                    const win = window.open('about:blank', '_blank');
                    
                    if (win) {
                        win.location.href = blobUrl;
                        // Clean up the blob URL after a delay
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                    } else {
                        // Fallback if popup is blocked
                        window.open(game.url, '_blank');
                    }
                } catch (e) {
                    console.error("Cloaking failed, falling back to direct launch:", e);
                    window.open(game.url, '_blank');
                }
                return;
            }
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
            } catch (err) {
                console.error("Error attempting to enable full-screen:", err);
            }
        };

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
