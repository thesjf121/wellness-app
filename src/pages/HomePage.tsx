import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../utils/constants';
import { WellnessCard, CardContent } from '../components/ui/WellnessCard';
import { BottomNavigation } from '../components/ui/BottomNavigation';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../components/ui/ParallaxContainer';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Hero Section with Parallax */}
      <ParallaxContainer
        backgroundGradient={parallaxPresets.homepage.backgroundGradient}
        className="relative"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 right-16 w-48 h-48 bg-purple-200/30 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sage-200/20 rounded-full blur-2xl"></div>
        </div>

        {/* Main Content with Parallax Layers */}
        <ParallaxLayer speed={0.2} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo/Icon */}
            <motion.div 
              className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg p-4"
              variants={itemVariants}
            >
              <img 
                src="/calerielife-logo.svg" 
                alt="CalerieLife Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              variants={itemVariants}
            >
              Creating Wellness Through
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Connection
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Track your steps, nourish your body with AI-powered nutrition insights, 
              and build lasting habits through meaningful social connections.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
              variants={itemVariants}
            >
              <motion.button 
                onClick={() => navigate(ROUTES.WELCOME)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Your Journey ✨
              </motion.button>
              <motion.button 
                onClick={() => navigate(ROUTES.DASHBOARD)}
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-200 shadow-md transition-all duration-300 transform hover:scale-105"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                View Dashboard
              </motion.button>
            </motion.div>
          </motion.div>
        </ParallaxLayer>
      </ParallaxContainer>

      {/* Features Section */}
      <ParallaxLayer speed={0.5} className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for
              <span className="block text-blue-600">holistic wellness</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines the best of movement, nutrition, and community 
              to help you build lasting healthy habits.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <WellnessCard variant="gradient" className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 text-center h-full">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-3xl">👟</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-900">Movement Tracking</h3>
                  <p className="text-blue-700 leading-relaxed">
                    Sync with your device to track daily steps and build healthy movement habits that stick.
                  </p>
                </CardContent>
              </WellnessCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <WellnessCard variant="gradient" className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 text-center h-full">
                <CardContent>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-3xl">🥗</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-green-900">Smart Nutrition</h3>
                  <p className="text-green-700 leading-relaxed">
                    Log your meals and get AI-powered insights on calories, macros, and micronutrients.
                  </p>
                </CardContent>
              </WellnessCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <WellnessCard variant="gradient" className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-center h-full">
                <CardContent>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-purple-900">Social Connection</h3>
                  <p className="text-purple-700 leading-relaxed">
                    Join accountability groups and learn from our comprehensive wellness coaching curriculum.
                  </p>
                </CardContent>
              </WellnessCard>
            </motion.div>
          </div>
        </div>
      </ParallaxLayer>

      {/* Additional Features Section */}
      <ParallaxLayer speed={0.8} className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Your wellness journey, 
                <span className="text-blue-600">simplified</span>
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Insights</h4>
                    <p className="text-gray-600">Get personalized recommendations based on your activity and nutrition patterns.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-green-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Community Support</h4>
                    <p className="text-gray-600">Connect with like-minded individuals on similar wellness journeys.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Expert Guidance</h4>
                    <p className="text-gray-600">Learn from our comprehensive wellness coaching curriculum and training modules.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <WellnessCard variant="glass" className="p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                    <span className="text-3xl">📱</span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Ready to get started?</h4>
                  <p className="text-gray-600 mb-6">Join thousands of others on their wellness journey today.</p>
                  <button 
                    onClick={() => navigate(ROUTES.STEP_COUNTER)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Try Step Tracker
                  </button>
                </div>
              </WellnessCard>
            </motion.div>
          </div>
        </div>
      </ParallaxLayer>
      
      {/* Bottom Navigation for Mobile */}
      <BottomNavigation />
    </>
  );
};

export default HomePage;