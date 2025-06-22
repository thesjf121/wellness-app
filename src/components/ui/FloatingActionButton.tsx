import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Camera, Mic, Keyboard, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FloatingActionButtonProps {
  onTextEntry: () => void;
  onCameraEntry?: () => void;
  onVoiceEntry?: () => void;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onTextEntry,
  onCameraEntry,
  onVoiceEntry,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleAction = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  const fabVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 260, damping: 20 }
    },
    tap: { scale: 0.95 }
  };

  const optionVariants = {
    hidden: { scale: 0, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20
      }
    },
    exit: { scale: 0, opacity: 0, y: 20 }
  };

  const options = [
    { icon: Keyboard, label: 'Text', action: onTextEntry, color: 'bg-blue-500' },
    ...(onCameraEntry ? [{ icon: Camera, label: 'Camera', action: onCameraEntry, color: 'bg-purple-500' }] : []),
    ...(onVoiceEntry ? [{ icon: Mic, label: 'Voice', action: onVoiceEntry, color: 'bg-green-500' }] : [])
  ];

  return (
    <div className={cn("fixed bottom-20 right-4 z-50", className)}>
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            />
            
            {/* Options */}
            <div className="absolute bottom-20 right-0 space-y-3">
              {options.map((option, index) => (
                <motion.button
                  key={option.label}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAction(option.action)}
                  className="flex items-center space-x-2 bg-white rounded-full shadow-lg px-4 py-3 hover:shadow-xl transition-shadow"
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", option.color)}>
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 pr-2">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        variants={fabVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
        onClick={toggleExpanded}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          isExpanded 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        )}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Pulse animation when not expanded */}
      {!isExpanded && (
        <motion.div
          className="absolute inset-0 rounded-full bg-green-500 -z-10"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};