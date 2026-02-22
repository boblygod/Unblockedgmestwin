async function init() {
    try {
        const response = await fetch('./games.json');
        const games = await response.json();
        const container = document.getElementById('games-container');

        games.forEach(game => {
            const section = document.createElement('section');
            section.className = 'space-y-4';
            section.innerHTML = `
                <div>
                    <h2 class="text-2xl font-bold">${game.title}</h2>
                    <p class="text-zinc-400">${game.description}</p>
                </div>
                <iframe 
                    src="${game.url}" 
                    allow="accelerometer *; ambient-light-sensor *; autoplay *; camera *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *; geolocation *; gyroscope *; local-network-access *; magnetometer *; microphone *; midi *; payment *; picture-in-picture *; screen-wake-lock *; speaker *; sync-xhr *; usb *; vibrate *; vr *; web-share *" 
                    sandbox="allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-storage-access-by-user-activation">
                </iframe>
            `;
            container.appendChild(section);
        });
    } catch (error) {
        console.error('Error loading games:', error);
    }
}

init();
