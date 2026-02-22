async function init() {
    const libraryView = document.getElementById('library-view');
    const playerView = document.getElementById('player-view');
    const gameFrame = document.getElementById('game-frame');
    const gameTitle = document.getElementById('current-game-title');
    const backBtn = document.getElementById('back-btn');
    const logo = document.getElementById('site-logo');

    try {
        const response = await fetch('./games.json');
        const games = await response.json();

        function showLibrary() {
            libraryView.classList.remove('hidden');
            playerView.classList.add('hidden');
            backBtn.classList.add('hidden');
            gameFrame.src = '';
        }

        function play(game) {
            libraryView.classList.add('hidden');
            playerView.classList.remove('hidden');
            backBtn.classList.remove('hidden');
            gameTitle.textContent = game.title;
            gameFrame.src = game.url;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        games.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card glass p-4 rounded-2xl cursor-pointer border border-transparent transition-all duration-300';
            card.innerHTML = `
                <img src="${game.thumbnail}" class="w-full aspect-video object-cover rounded-xl mb-4" referrerpolicy="no-referrer">
                <h3 class="text-xl font-bold">${game.title}</h3>
                <p class="text-zinc-400 text-sm mt-1">${game.description}</p>
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
