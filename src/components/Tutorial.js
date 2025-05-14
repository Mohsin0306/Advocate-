import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "K-Map Kya Hai?",
      content: `K-Map ek special table hai jo Boolean expressions ko simplify karne mein help karta hai.

Example:
Agar humein yeh expression milta hai:
F = A'B + AB' + AB

To ise K-Map se solve kar sakte hain.`
    },
    {
      title: "K-Map Grid Kaise Samjhein?",
      content: `K-Map grid mein har cell ka ek special meaning hai:

m0: Jab A=0, B=0
m1: Jab A=0, B=1
m2: Jab A=1, B=0
m3: Jab A=1, B=1

Har cell mein 0 ya 1 likha jata hai, jo truth table se aata hai.`
    },
    {
      title: "Values Kaise Set Karein?",
      content: `Truth table se values ko K-Map mein transfer karein:

1. Truth table mein dekhain ki har input combination ka output kya hai
2. Us output ko K-Map ke corresponding cell mein likhein
3. Har cell par tap karke value change kar sakte hain (0 ↔ 1)`
    },
    {
      title: "Groups Kaise Banayein?",
      content: `Groups banane ke rules:

1. Sirf 1s ko group karein
2. Groups adjacent cells ke honge (side by side)
3. Har group mein cells ki taadad 2 ki power honi chahiye (1, 2, 4, 8...)
4. Groups overlap ho sakte hain
5. Har 1 ko kam se kam ek group mein hona chahiye`
    },
    {
      title: "Result Kaise Nikalein?",
      content: `Result nikalne ke liye:

1. Har group se ek term nikalein
2. Group ke cells ko dekh kar variables ka combination banayein
3. Saare terms ko + se connect karein

Example:
Agar ek group mein m0 aur m1 hai, to term A' banega
Agar ek group mein m2 aur m3 hai, to term A banega`
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-purple-800">
              {steps[currentStep].title}
            </h3>
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    currentStep === index ? 'bg-purple-500' : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line">
              {steps[currentStep].content}
            </p>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
            >
              {currentStep === steps.length - 1 ? 'Start Learning' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Tutorial; 