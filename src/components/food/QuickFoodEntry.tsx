import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface QuickFoodEntryProps {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  onSubmit: (foodDescription: string) => void;
  recentFoods?: string[];
  placeholder?: string;
  autoFocus?: boolean;
}

export const QuickFoodEntry: React.FC<QuickFoodEntryProps> = ({
  mealType,
  onSubmit,
  recentFoods = [],
  placeholder = "What did you eat?",
  autoFocus = false
}) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mealEmojis = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍿'
  };

  const mealColors = {
    breakfast: 'from-yellow-400 to-orange-400',
    lunch: 'from-blue-400 to-cyan-400',
    dinner: 'from-purple-400 to-pink-400',
    snack: 'from-green-400 to-emerald-400'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
      setShowSuggestions(false);
    }
  };

  const handleRecentSelect = (food: string) => {
    setInput(food);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Meal indicator */}
          <div className={cn(
            "w-12 h-12 flex items-center justify-center bg-gradient-to-r",
            mealColors[mealType]
          )}>
            <span className="text-2xl">{mealEmojis[mealType]}</span>
          </div>

          {/* Input field */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(e.target.value.length === 0 && recentFoods.length > 0);
            }}
            onFocus={() => setShowSuggestions(input.length === 0 && recentFoods.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
          />

          {/* Quick actions */}
          <div className="flex items-center pr-2 space-x-1">
            {recentFoods.length > 0 && (
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Clock className="w-5 h-5" />
              </button>
            )}
            
            <motion.button
              type="submit"
              disabled={!input.trim()}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "p-2 rounded-lg transition-all",
                input.trim() 
                  ? "bg-green-500 text-white hover:bg-green-600" 
                  : "bg-gray-100 text-gray-300"
              )}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </form>

      {/* Recent foods dropdown */}
      <AnimatePresence>
        {showSuggestions && recentFoods.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10"
          >
            <div className="p-2">
              <p className="text-xs text-gray-500 px-3 py-1">Recent foods</p>
              <div className="space-y-1">
                {recentFoods.slice(0, 5).map((food, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleRecentSelect(food)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{food}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};