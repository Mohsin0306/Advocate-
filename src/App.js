import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import KMapGrid from './components/KMapGrid';
import GameInstructions from './components/GameInstructions';
import Tutorial from './components/Tutorial';
import KMapTest from './components/KMapTest';
import IntroLoader from './components/IntroLoader';

const App = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('game'); // 'game' or 'instructions' or 'test'
  const [showTutorial, setShowTutorial] = useState(false);

  // Show tutorial automatically only on first visit
  useEffect(() => {
    const learned = localStorage.getItem('tutorialLearned');
    if (!learned) {
      setShowTutorial(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('tutorialLearned', 'yes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100">
      {showIntro ? (
        <IntroLoader onComplete={handleIntroComplete} />
      ) : (
        <>
          {/* Mobile App-like Header */}
          <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-center">
              <h1 className="text-xl font-bold text-purple-800 text-center">
                Advocate 
              </h1>
              <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png" alt="Beaming Face with Smiling Eyes" width="25" height="25" />
            </div>
          </div>

          {/* Main Content with proper spacing for fixed header */}
          <div className="container mx-auto px-4 pt-16 pb-20">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-4 bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setActiveTab('game')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'game' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-purple-50'}`}
              >
                K-Map
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'test' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-purple-50'}`}
              >
                Test
              </button>
              <button
                onClick={() => setActiveTab('instructions')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${activeTab === 'instructions' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-purple-50'}`}
              >
                Guide
              </button>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'game' ? (
                  <div className="space-y-4">
                    <KMapGrid />
                  </div>
                ) : activeTab === 'test' ? (
                  <KMapTest />
                ) : (
                  <GameInstructions />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile App-like Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md z-10">
            <div className="container mx-auto px-4 py-2">
              <div className="flex justify-around items-center">
                <button
                  onClick={() => setActiveTab('game')}
                  className={`flex flex-col items-center p-2 ${
                    activeTab === 'game' ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span className="text-xs mt-1">Game</span>
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`flex flex-col items-center p-2 ${
                    activeTab === 'test' ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="text-xs mt-1">Test</span>
                </button>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex flex-col items-center p-2 text-purple-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs mt-1">Tutorial</span>
                </button>
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`flex flex-col items-center p-2 ${
                    activeTab === 'instructions' ? 'text-purple-600' : 'text-gray-500'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-xs mt-1">Guide</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tutorial Modal */}
          {showTutorial && (
            <Tutorial onComplete={handleTutorialComplete} />
          )}
        </>
      )}
    </div>
  );
};

export default App;