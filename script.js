let allGames = [];

// Initialize
async function init() {
    document.getElementById('year').textContent = new Date().getFullYear();
    
    try {
        const response = await fetch('./games.json');
        allGames = await response.json();
        renderGames(allGames);
    } catch (error) {
        console.error('Error loading games:', error);
    }

    // Event Listeners
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('logo').addEventListener('click', showLibrary);
    document.getElementById('back-btn').addEventListener('click', showLibrary);
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);
}

function renderGames(games) {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = '';

    if (games.length === 0) {
        return;
    }

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card group cursor-pointer glass rounded-2xl overflow-hidden transition-all duration-300';
        card.innerHTML = `
            <div class="aspect-video relative overflow-hidden">
                <img src="${game.thumbnail}" alt="${game.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span class="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">PLAY NOW</span>
                </div>
            </div>
            <div class="p-4 space-y-1">
                <h3 class="font-bold text-lg group-hover:text-emerald-400 transition-colors">${game.title}</h3>
                <p class="text-sm text-zinc-400 line-clamp-2">${game.description}</p>
            </div>
        `;
        card.onclick = () => playGame(game);
        grid.appendChild(card);
    });
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = allGames.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.description.toLowerCase().includes(query)
    );
    renderGames(filtered);
}

function playGame(game) {
    document.getElementById('library-view').classList.add('hidden');
    document.getElementById('search-container').classList.add('hidden');
    document.getElementById('player-view').classList.remove('hidden');
    document.getElementById('back-btn').classList.remove('hidden');

    document.getElementById('game-title').textContent = game.title;
    document.getElementById('game-desc').textContent = game.description;
    document.getElementById('game-frame').src = game.url;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLibrary() {
    document.getElementById('library-view').classList.remove('hidden');
    document.getElementById('search-container').classList.remove('hidden');
    document.getElementById('player-view').classList.add('hidden');
    document.getElementById('back-btn').classList.add('hidden');
    document.getElementById('game-frame').src = '';
}

function toggleFullscreen() {
    const container = document.getElementById('iframe-container');
    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

init();
