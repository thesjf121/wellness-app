import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { TrainingModuleNavigation } from '../../components/training/TrainingModuleNavigation';
import { ModuleViewer } from '../../components/training/ModuleViewer';
import { WellnessCard, CardHeader, CardTitle, CardContent } from '../../components/ui/WellnessCard';
import { BottomNavigation } from '../../components/ui/BottomNavigation';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const TrainingPage: React.FC = () => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const { moduleId } = useParams();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(moduleId || null);
  const [showModuleSelector, setShowModuleSelector] = useState(false);

  useEffect(() => {
    console.log('TrainingPage: moduleId from URL:', moduleId);
    if (moduleId) {
      console.log('TrainingPage: Setting selectedModuleId to:', moduleId);
      setSelectedModuleId(moduleId);
    } else {
      setSelectedModuleId(null);
    }
  }, [moduleId]);

  console.log('TrainingPage render: selectedModuleId =', selectedModuleId);

  if (!isSignedIn && !moduleId) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
          <WellnessCard variant="gradient" className="bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <CardContent className="text-center p-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🎓</span>
              </div>
              <CardTitle className="text-2xl mb-4">Wellness Training</CardTitle>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Please sign in to access your training modules and track your progress on your wellness coaching journey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <motion.a
                  href="/login"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.a>
                <motion.a
                  href="/register"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-xl font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.a>
              </div>
            </CardContent>
          </WellnessCard>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <ParallaxContainer
        backgroundGradient={parallaxPresets.training.backgroundGradient}
        className="min-h-screen"
      >
        <ParallaxLayer speed={0.35} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8"
        >
          <div className="flex items-center mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
              <p className="text-gray-600">Comprehensive wellness coaching curriculum</p>
            </div>
          </div>
          
          {selectedModuleId && (
            <motion.button
              onClick={() => setSelectedModuleId(null)}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium transition-all flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Modules
            </motion.button>
          )}
        </motion.div>

        {/* Mobile Layout */}
        {isMobile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {selectedModuleId ? (
              <>
                {/* Floating Module Switcher */}
                <div className="sticky top-4 z-40 bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                  <button
                    onClick={() => setShowModuleSelector(true)}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🎓</span>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 text-sm">Current Module</div>
                        <div className="text-xs text-gray-600">Tap to switch modules</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Module Content */}
                <WellnessCard className="h-full">
                  <CardContent className="p-0">
                    <ModuleViewer
                      userId={user.id}
                      moduleId={selectedModuleId}
                      onProgressUpdate={() => {
                        setSelectedModuleId(selectedModuleId);
                      }}
                    />
                  </CardContent>
                </WellnessCard>
              </>
            ) : (
              /* Module Selection */
              <WellnessCard className="h-full">
                <CardContent className="p-0">
                  <TrainingModuleNavigation
                    userId={user.id}
                    currentModuleId={selectedModuleId || undefined}
                    onModuleSelect={(moduleId) => {
                      setSelectedModuleId(moduleId);
                      setShowModuleSelector(false);
                    }}
                  />
                </CardContent>
              </WellnessCard>
            )}

            {/* Mobile Module Selector Modal */}
            {showModuleSelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="bg-white w-full rounded-t-3xl max-h-[80vh] overflow-y-auto"
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-gray-900">Select Module</h2>
                      <button
                        onClick={() => setShowModuleSelector(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2"></div>
                  </div>
                  <div className="p-4">
                    <TrainingModuleNavigation
                      userId={user.id}
                      currentModuleId={selectedModuleId || undefined}
                      onModuleSelect={(moduleId) => {
                        setSelectedModuleId(moduleId);
                        setShowModuleSelector(false);
                      }}
                    />
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Desktop Layout */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Module Navigation */}
            <div className={`${selectedModuleId ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
              <WellnessCard className="h-full">
                <CardContent className="p-0">
                  <TrainingModuleNavigation
                    userId={user.id}
                    currentModuleId={selectedModuleId || undefined}
                    onModuleSelect={setSelectedModuleId}
                  />
                </CardContent>
              </WellnessCard>
            </div>

            {/* Module Viewer */}
            {selectedModuleId && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-8"
              >
                <WellnessCard className="h-full">
                  <CardContent className="p-0">
                    <ModuleViewer
                      userId={user.id}
                      moduleId={selectedModuleId}
                      onProgressUpdate={() => {
                        setSelectedModuleId(selectedModuleId);
                      }}
                    />
                  </CardContent>
                </WellnessCard>
              </motion.div>
            )}
          </motion.div>
        )}
        </ParallaxLayer>
      </ParallaxContainer>
      
      <BottomNavigation />
    </>
  );
};

export default TrainingPage;