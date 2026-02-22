import { GoogleGenAI } from "@google/genai";

async function init() {
    const libraryView = document.getElementById('library-view');
    const playerView = document.getElementById('player-view');
    const gameFrame = document.getElementById('game-frame');
    const gameTitle = document.getElementById('current-game-title');
    const gameDesc = document.getElementById('current-game-desc');
    const backBtn = document.getElementById('back-btn');
    const logo = document.getElementById('site-logo');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    // AI Assistant Elements
    const aiToggle = document.getElementById('ai-toggle');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiClose = document.getElementById('ai-close');
    const aiMessages = document.getElementById('ai-messages');
    const aiForm = document.getElementById('ai-form');
    const aiInput = document.getElementById('ai-input');

    // Initialize Gemini
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = "gemini-3-flash-preview";
    
    let chat;

    try {
        const response = await fetch(`./games.json?t=${Date.now()}`);
        const games = await response.json();

        // Initialize chat with system instruction
        chat = genAI.chats.create({
            model: model,
            config: {
                systemInstruction: `You are the Arcade Hub Assistant. You help users find games in the library and answer questions about them. 
                The current games in the library are: ${games.map(g => g.title).join(', ')}.
                Be friendly, helpful, and concise. If a user asks for a game recommendation, suggest one from the list.`,
            },
        });

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
                
                // No automatic focus or pointer lock here
                // This allows the user to use menus before the game takes control
            } catch (err) {
                console.error("Error attempting to enable full-screen:", err);
            }
        };

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            if (document.fullscreenElement === gameFrame) {
                // We don't force focus here either
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

        // AI Assistant Logic
        aiToggle.onclick = () => {
            aiChatWindow.classList.toggle('hidden');
            if (!aiChatWindow.classList.contains('hidden')) {
                aiInput.focus();
            }
        };

        aiClose.onclick = () => {
            aiChatWindow.classList.add('hidden');
        };

        function addMessage(text, isUser = false) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;
            
            const icon = isUser 
                ? `<div class="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                   </div>`
                : `<div class="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                   </div>`;

            msgDiv.innerHTML = `
                ${icon}
                <div class="${isUser ? 'bg-emerald-500 text-white' : 'bg-white/5 text-zinc-300'} rounded-2xl ${isUser ? 'rounded-tr-none' : 'rounded-tl-none'} p-3 text-sm max-w-[80%]">
                    ${text}
                </div>
            `;
            aiMessages.appendChild(msgDiv);
            aiMessages.scrollTop = aiMessages.scrollHeight;
            return msgDiv;
        }

        aiForm.onsubmit = async (e) => {
            e.preventDefault();
            const text = aiInput.value.trim();
            if (!text) return;

            aiInput.value = '';
            addMessage(text, true);

            // Add loading indicator
            const loadingMsg = addMessage('Thinking...');
            
            try {
                const result = await chat.sendMessage({ message: text });
                loadingMsg.remove();
                addMessage(result.text);
            } catch (error) {
                console.error('Gemini Error:', error);
                loadingMsg.remove();
                addMessage('Sorry, I encountered an error. Please try again.');
            }
        };

    } catch (error) {
        console.error('Error loading games:', error);
    }
}

init();
