import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KMapTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "Agar F = A'B + AB' + AB hai, to K-Map mein values kya hongi?",
      options: [
        "A'B'=0, A'B=1, AB'=1, AB=1",
        "A'B'=1, A'B=1, AB'=1, AB=0",
        "A'B'=0, A'B=1, AB'=1, AB=0",
        "A'B'=1, A'B=0, AB'=1, AB=1"
      ],
      correctAnswer: "A'B'=0, A'B=1, AB'=1, AB=1",
      explanation: "A'B = A'B cell mein 1, AB' = AB' cell mein 1, AB = AB cell mein 1, aur A'B' cell mein 0"
    },
    {
      question: "Agar K-Map mein A'B'=1, A'B=0, AB'=1, AB=1 hai, to simplified expression kya hogi?",
      options: [
        "F = A + B",
        "F = A' + B",
        "F = A + B'",
        "F = A' + B'"
      ],
      correctAnswer: "F = A + B'",
      explanation: "A'B' aur AB' ko group karke A milta hai, aur AB' aur AB ko group karke B' milta hai"
    },
    {
      question: "Agar F = A'B' + A'B + AB hai, to K-Map mein kitne groups banenge?",
      options: [
        "1 group",
        "2 groups",
        "3 groups",
        "4 groups"
      ],
      correctAnswer: "2 groups",
      explanation: "A'B' + A'B = A' (vertical group), aur AB = AB (single cell), isliye 2 groups banenge"
    },
    {
      question: "3-variable K-Map mein, agar F = A'B'C' + A'BC + ABC hai, to kitne cells 1 honge?",
      options: [
        "2 cells",
        "3 cells",
        "4 cells",
        "5 cells"
      ],
      correctAnswer: "3 cells",
      explanation: "A'B'C' cell mein 1, A'BC cell mein 1, aur ABC cell mein 1, baaki cells mein 0"
    },
    {
      question: "K-Map mein agar A'B' aur AB' cells 1 hain, to simplified expression kya hogi?",
      options: [
        "F = A'",
        "F = B'",
        "F = A",
        "F = B"
      ],
      correctAnswer: "F = B'",
      explanation: "A'B' aur AB' cells ko group karke B' milta hai, kyunki A variable dono cells mein different hai"
    },
    {
      question: "3-variable K-Map mein, agar F = A'B'C' + A'B'C + A'BC + A'BC' hai, to simplified expression kya hogi?",
      options: [
        "F = A'",
        "F = B'",
        "F = C'",
        "F = A'B'"
      ],
      correctAnswer: "F = A'",
      explanation: "Ye saare cells A' row mein hain, isliye sirf A' rahega, B aur C dono variables eliminate ho jayenge"
    },
    {
      question: "K-Map mein agar saare cells 1 hain, to simplified expression kya hogi?",
      options: [
        "F = A + B",
        "F = A' + B'",
        "F = 1",
        "F = 0"
      ],
      correctAnswer: "F = 1",
      explanation: "Jab saare cells 1 hain, to expression always true hogi, isliye F = 1"
    },
    {
      question: "3-variable K-Map mein, agar F = A'B'C' + A'B'C + AB'C' + AB'C hai, to simplified expression kya hogi?",
      options: [
        "F = A'B'",
        "F = B'",
        "F = A'C'",
        "F = B'C'"
      ],
      correctAnswer: "F = B'",
      explanation: "Ye saare cells B' columns mein hain, isliye sirf B' rahega, A aur C dono variables eliminate ho jayenge"
    }
  ];

  const handleAnswer = (answer) => {
    setUserAnswer(answer);
    setShowResult(true);
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setShowResult(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-800">K-Map Test</h3>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1}/{questions.length}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-4">{questions[currentQuestion].question}</p>
          
          <div className="space-y-2">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={`w-full p-3 text-left rounded-lg border-2 transition-colors
                  ${showResult 
                    ? option === questions[currentQuestion].correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : option === userAnswer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    : 'border-purple-200 hover:border-purple-500'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 p-3 rounded-lg mb-4"
          >
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Explanation:</span> {questions[currentQuestion].explanation}
            </p>
          </motion.div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Score: {score}/{currentQuestion + 1}
          </div>
          {showResult && currentQuestion < questions.length - 1 && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Agla Question
            </button>
          )}
        </div>

        {currentQuestion === questions.length - 1 && showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-4 bg-green-50 rounded-lg text-center"
          >
            <h4 className="text-lg font-semibold text-green-800 mb-2">Test Complete!</h4>
            <p className="text-green-700">
              Final Score: {score}/{questions.length}
            </p>
            {score === questions.length && (
              <p className="text-green-600 mt-2">
                Bohat zabardast! Aap K-Map ke expert ban gaye hain! 🎉
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default KMapTest; 