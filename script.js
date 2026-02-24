import { GoogleGenAI } from "@google/genai";

async function init() {
    const libraryView = document.getElementById('library-view');
    const playerView = document.getElementById('player-view');
    const chatView = document.getElementById('chat-view');
    const gameFrame = document.getElementById('game-frame');
    const gameTitle = document.getElementById('current-game-title');
    const gameDesc = document.getElementById('current-game-desc');
    const backBtn = document.getElementById('back-btn');
    const aiBtn = document.getElementById('ai-btn');
    const logo = document.getElementById('site-logo');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Chat elements
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Initialize Gemini
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await fetch(`./games.json?t=${Date.now()}`);
        if (!response.ok) throw new Error(`Failed to load games: ${response.statusText}`);
        const games = await response.json();

        function showLibrary() {
            libraryView.classList.remove('hidden');
            playerView.classList.add('hidden');
            chatView.classList.add('hidden');
            backBtn.classList.add('hidden');
            aiBtn.classList.remove('hidden');
            gameFrame.src = '';
            document.title = 'https://safehavenbms.github.io/SafeHaven/';
        }

        function showChat() {
            libraryView.classList.add('hidden');
            playerView.classList.add('hidden');
            chatView.classList.remove('hidden');
            backBtn.classList.remove('hidden');
            aiBtn.classList.add('hidden');
            document.title = 'AI Assistant | SafeHavenBMS';
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
                        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
                    } else {
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
            chatView.classList.add('hidden');
            backBtn.classList.remove('hidden');
            aiBtn.classList.add('hidden');
            gameTitle.textContent = game.title;
            gameDesc.textContent = game.description;
            document.title = `${game.title} | https://safehavenbms.github.io/SafeHaven/`;
            
            gameFrame.setAttribute('allow', 'accelerometer *; ambient-light-sensor *; autoplay *; camera *; clipboard-read *; clipboard-write *; encrypted-media *; fullscreen *; geolocation *; gyroscope *; local-network-access *; magnetometer *; microphone *; midi *; payment *; picture-in-picture *; screen-wake-lock *; speaker *; sync-xhr *; usb *; vibrate *; vr *; web-share *; pointer-lock *');
            gameFrame.setAttribute('sandbox', 'allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation-by-user-activation allow-storage-access-by-user-activation allow-pointer-lock');
            
            gameFrame.src = game.url;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Chat Logic
        async function handleChat(e) {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            addMessage(message, 'user');
            chatInput.value = '';

            const typingId = addTypingIndicator();
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const result = await genAI.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: message,
                    config: {
                        systemInstruction: "You are a helpful AI assistant integrated into SafeHavenBMS. You specialize in helping students with history, math, English, and science. Keep your answers concise, accurate, and encouraging."
                    }
                });
                
                removeTypingIndicator(typingId);
                addMessage(result.text, 'ai');
            } catch (error) {
                console.error('AI Error:', error);
                removeTypingIndicator(typingId);
                addMessage("I'm sorry, I encountered an error. Please try again later.", 'ai');
            }
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function addMessage(text, sender) {
            const div = document.createElement('div');
            div.className = `${sender}-message chat-message`;
            div.textContent = text;
            chatMessages.appendChild(div);
            return div;
        }

        function addTypingIndicator() {
            const id = 'typing-' + Date.now();
            const div = document.createElement('div');
            div.id = id;
            div.className = 'ai-message chat-message typing-indicator';
            div.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatMessages.appendChild(div);
            return id;
        }

        function removeTypingIndicator(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        chatForm.onsubmit = handleChat;
        aiBtn.onclick = showChat;

        fullscreenBtn.onclick = async () => {
            try {
                if (gameFrame.requestFullscreen) {
                    await gameFrame.requestFullscreen();
                } else if (gameFrame.webkitRequestFullscreen) {
                    await gameFrame.webkitRequestFullscreen();
                } else if (gameFrame.msRequestFullscreen) {
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
