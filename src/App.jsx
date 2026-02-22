/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { Search, Gamepad2, ArrowLeft, Maximize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gamesData from './games.json';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const filteredGames = useMemo(() => {
    return gamesData.filter(game =>
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setSelectedGame(null)}
          >
            <div className="bg-emerald-500 p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Gamepad2 className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight">
              UNBLOCKED<span className="text-emerald-500">GAMES</span>
            </h1>
          </div>

          {!selectedGame && (
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search games..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {selectedGame && (
            <button 
              onClick={() => setSelectedGame(null)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Library
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {!selectedGame ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-3xl font-display font-bold">Featured Games</h2>
                  <p className="text-zinc-400">Hand-picked unblocked games for your enjoyment.</p>
                </div>

                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames.map((game) => (
                      <motion.div
                        key={game.id}
                        layoutId={game.id}
                        onClick={() => handleGameSelect(game)}
                        className="group cursor-pointer glass rounded-2xl overflow-hidden game-card-hover"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img 
                            src={game.thumbnail} 
                            alt={game.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">PLAY NOW</span>
                          </div>
                        </div>
                        <div className="p-4 space-y-1">
                          <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">{game.title}</h3>
                          <p className="text-sm text-zinc-400 line-clamp-2">{game.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-zinc-500">No games found matching your search.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="player"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-display font-bold">{selectedGame.title}</h2>
                    <p className="text-zinc-400 max-w-2xl">{selectedGame.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={toggleFullScreen}
                      className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                      title="Toggle Fullscreen"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <a 
                      href={selectedGame.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                      title="Open in New Tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className={`relative glass rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/5 ${isFullScreen ? 'fixed inset-0 z-[100] rounded-none' : 'aspect-video w-full'}`}>
                  {isFullScreen && (
                    <button 
                      onClick={toggleFullScreen}
                      className="absolute top-6 right-6 z-[101] p-3 glass rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  )}
                  <iframe
                    src={selectedGame.url}
                    className="w-full h-full border-none"
                    allow="fullscreen; autoplay; encrypted-media"
                    title={selectedGame.title}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-white/5 text-center text-zinc-500 text-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Unblocked Games Hub. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">DMCA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
