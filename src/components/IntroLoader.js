import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroLoader = ({ onComplete }) => {
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    // Show name after emoji animation
    const timer = setTimeout(() => {
      setShowName(true);
    }, 800);

    // Complete intro after all animations
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 20,
            duration: 0.8
          }}
          className="w-20 h-20 mb-4"
        >
          <img 
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png"
            alt="Beaming Face"
            className="w-full h-full object-contain"
          />
        </motion.div>

        <AnimatePresence>
          {showName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.5
              }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-purple-800">
                Advocate
              </h1>
              <p className="text-sm text-purple-600 mt-2">
                K-Map Learning Platform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntroLoader; 