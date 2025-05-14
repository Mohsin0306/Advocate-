import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GameInstructions = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "K-Map kya hai?",
      content: (
        <div className="space-y-3">
          <p>K-Map (Karnaugh Map) aik visual tool hai jo Boolean algebra ko solve karne mein madad karta hai.</p>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="font-semibold mb-2">Example:</p>
            <p>Agar aapke pass yeh Boolean expression hai:</p>
            <p className="font-mono bg-white p-2 rounded mt-2">F = A'B + AB' + AB</p>
            <p className="mt-2">Isse K-Map mein represent kiya jata hai grid ki shakal mein.</p>
          </div>
        </div>
      )
    },
    {
      title: "K-Map kaise use karein?",
      content: (
        <div className="space-y-3">
          <p>K-Map ko use karne ke liye in steps ko follow karein:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Truth table se values K-Map mein transfer karein</li>
            <li>Adjacent cells ko groups mein organize karein</li>
            <li>Har group se ek term banayein</li>
          </ol>
          <div className="bg-purple-50 p-3 rounded-lg mt-3">
            <p className="font-semibold mb-2">Practical Example:</p>
            <p>2x2 K-Map mein:</p>
            <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded mt-2">
              <div className="border p-2">1</div>
              <div className="border p-2">0</div>
              <div className="border p-2">1</div>
              <div className="border p-2">1</div>
            </div>
            <p className="mt-2">Isse simplify karke milta hai: F = A + B</p>
          </div>
        </div>
      )
    },
    {
      title: "Game ke Rules",
      content: (
        <div className="space-y-3">
          <p>Game ke main rules yeh hain:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Cells par tap karke values change karein (0 ya 1)</li>
            <li>Adjacent cells ko groups mein organize karein</li>
            <li>Har group mein cells ki taadad 2 ki power honi chahiye (2, 4, 8, etc.)</li>
            <li>Minimum groups banayein taki expression simple ho</li>
          </ul>
          <div className="bg-purple-50 p-3 rounded-lg mt-3">
            <p className="font-semibold mb-2">Tips:</p>
            <p>- Pehle 1s ko groups mein organize karein</p>
            <p>- Groups ko possible ho to bada banayein</p>
            <p>- Har cell ko kam se kam ek group mein hona chahiye</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-4 max-w-2xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-purple-800 mb-4 text-center">
        K-Map Game ke Instructions
      </h2>
      
      <div className="flex justify-center space-x-2 mb-6">
        {steps.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveStep(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              activeStep === index ? 'bg-purple-500' : 'bg-purple-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 text-gray-700"
        >
          <h3 className="text-xl font-semibold text-purple-700">
            {steps[activeStep].title}
          </h3>
          {steps[activeStep].content}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
          disabled={activeStep === 0}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={activeStep === steps.length - 1}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </motion.div>
  );
};

export default GameInstructions; 