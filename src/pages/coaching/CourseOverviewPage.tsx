import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../components/ui/WellnessCard';
import { ParallaxContainer, ParallaxLayer } from '../../components/ui/ParallaxContainer';
import { 
  ArrowLeftIcon, 
  PlayIcon, 
  ClockIcon, 
  AcademicCapIcon,
  CheckCircleIcon,
  UserGroupIcon,
  BookOpenIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const CourseOverviewPage: React.FC = () => {
  const navigate = useNavigate();

  const courseStats = [
    { icon: AcademicCapIcon, label: '8 Comprehensive Modules', value: '400+ minutes' },
    { icon: BookOpenIcon, label: 'Evidence-Based Content', value: '50+ exercises' },
    { icon: UserGroupIcon, label: 'Interactive Learning', value: 'Self-paced' },
    { icon: TrophyIcon, label: 'Professional Certificate', value: 'Upon completion' }
  ];

  const modules = [
    {
      number: 1,
      title: 'Introduction to Wellness Coaching & Holistic Health',
      duration: '45 min',
      description: 'Define wellness coaching, explore holistic health, and understand the role of a coach.',
      keyTopics: [
        'What is wellness coaching and how it differs from other fields',
        'The 7 dimensions of holistic health and their interconnections',
        'Core coaching principles and mindset development',
        'Coaching vs. expert language and approach'
      ]
    },
    {
      number: 2,
      title: 'Physical Wellness – Movement, Exercise & Sleep',
      duration: '50 min',
      description: 'Explore movement, sleep, and recovery as the foundation of physical wellness.',
      keyTopics: [
        'Science and benefits of movement for body and mind',
        'FITT-VP principle for personalized exercise planning',
        'Sleep architecture and optimization strategies',
        'Creating sustainable movement and recovery routines'
      ]
    },
    {
      number: 3,
      title: 'Nutrition & Healthy Eating Habits',
      duration: '40 min',
      description: 'Break down practical nutrition strategies for sustained energy and mental clarity.',
      keyTopics: [
        'Macronutrients and micronutrients simplified',
        'Mindful eating and intuitive nutrition principles',
        'Plate method for balanced meals without measuring',
        'Sustainable healthy eating strategies and swaps'
      ]
    },
    {
      number: 4,
      title: 'Mental & Emotional Well-Being',
      duration: '55 min',
      description: 'Explore how thoughts, emotions, and psychological patterns influence well-being.',
      keyTopics: [
        'Understanding mental and emotional wellness components',
        'Identifying and shifting limiting thought patterns',
        'Cognitive distortions and reframing techniques',
        'Building emotional resilience and self-compassion'
      ]
    },
    {
      number: 5,
      title: 'Stress Management & Mindfulness',
      duration: '48 min',
      description: 'Learn to identify stress, manage it proactively, and use mindfulness to stay grounded.',
      keyTopics: [
        'Biology and psychology of stress responses',
        'Personal stress patterns and trigger identification',
        'Mindfulness techniques for immediate stress relief',
        'Daily practices for stress prevention and management'
      ]
    },
    {
      number: 6,
      title: 'Healthy Habits & Behavior Change',
      duration: '52 min',
      description: 'Explore the psychology of habit formation and how to make lasting change stick.',
      keyTopics: [
        'The habit loop and neuroscience of behavior formation',
        'Personal habit audit and pattern analysis',
        'The 2-minute rule and habit stacking strategies',
        'Systems design for sustainable behavior change'
      ]
    },
    {
      number: 7,
      title: 'Self-Coaching & Long-Term Motivation',
      duration: '45 min',
      description: 'Learn to coach yourself for sustained motivation, resilience, and accountability.',
      keyTopics: [
        'Developing your inner coach vs. inner critic',
        'GROW model and powerful self-coaching questions',
        'Progress tracking and momentum building strategies',
        'Self-compassion as a motivational tool'
      ]
    },
    {
      number: 8,
      title: 'Capstone – Personal Wellness Plan',
      duration: '60 min',
      description: 'Integrate everything into a living, breathing Personal Wellness Plan.',
      keyTopics: [
        'Creating a compelling personal wellness vision',
        'SMART-ER goal setting across wellness dimensions',
        'Designing systems and rituals for follow-through',
        'Building your personal operating system for success'
      ]
    }
  ];

  const learningOutcomes = [
    'Master evidence-based wellness coaching principles and techniques',
    'Develop expertise in all 7 dimensions of holistic health',
    'Create personalized wellness plans using proven frameworks',
    'Build sustainable habits and behavior change systems',
    'Apply mindfulness and stress management in daily practice',
    'Coach yourself and others toward lasting transformation',
    'Design environments and rituals that support wellness goals',
    'Integrate physical, mental, emotional, and spiritual well-being'
  ];

  return (
    <ParallaxContainer
      backgroundGradient="from-purple-50 via-blue-50 to-indigo-100"
      className="min-h-screen"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/coaching')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Coaching
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Wellness Coaching Masterclass
              </span>
              <br />
              <span className="text-2xl md:text-3xl text-gray-700">Course Overview</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              A comprehensive 8-module program designed to teach you the art and science of wellness coaching. 
              Learn evidence-based techniques to guide lasting behavior change and transformation.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.button
                onClick={() => navigate('/coaching/module/1')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Module 1
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/coaching')}
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Full Landing Page
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Course Stats */}
        <ParallaxLayer speed={0.3}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {courseStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <WellnessCard className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{stat.label}</h3>
                    <p className="text-purple-600 font-medium">{stat.value}</p>
                  </CardContent>
                </WellnessCard>
              </motion.div>
            ))}
          </div>
        </ParallaxLayer>

        {/* Learning Outcomes */}
        <ParallaxLayer speed={0.4}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <WellnessCard>
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  What You'll Learn
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>
        </ParallaxLayer>

        {/* Detailed Module Breakdown */}
        <ParallaxLayer speed={0.5}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Detailed Module Breakdown
            </h2>
            
            <div className="space-y-6">
              {modules.map((module, index) => (
                <motion.div
                  key={module.number}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <WellnessCard className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Module Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 lg:w-1/3">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                              <span className="text-xl font-bold">{module.number}</span>
                            </div>
                            <div className="flex items-center text-white/80">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              <span className="text-sm">{module.duration}</span>
                            </div>
                          </div>
                          <h3 className="text-xl font-semibold mb-3">
                            {module.title}
                          </h3>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {module.description}
                          </p>
                          <motion.button
                            onClick={() => navigate(`/coaching/module/${module.number}`)}
                            className="mt-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <PlayIcon className="w-4 h-4 mr-2" />
                            Start Module
                          </motion.button>
                        </div>
                        
                        {/* Module Content */}
                        <div className="p-6 lg:w-2/3">
                          <h4 className="font-semibold text-gray-900 mb-4">Key Topics Covered:</h4>
                          <ul className="space-y-3">
                            {module.keyTopics.map((topic, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-purple-500 mr-3 mt-1">•</span>
                                <span className="text-gray-700 leading-relaxed">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </WellnessCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </ParallaxLayer>

        {/* Call to Action */}
        <ParallaxLayer speed={0.6}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <WellnessCard className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Begin Your Wellness Coaching Journey?
                </h2>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join the movement of wellness professionals making a real difference in people's lives. 
                  Your transformation starts with Module 1.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <motion.button
                    onClick={() => navigate('/coaching/module/1')}
                    className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Start Module 1 Now
                  </motion.button>
                  
                  <motion.button
                    onClick={() => navigate('/coaching')}
                    className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Back to Course Info
                  </motion.button>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>
        </ParallaxLayer>
      </div>
    </ParallaxContainer>
  );
};

export default CourseOverviewPage;