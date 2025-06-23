import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { WellnessCard, CardContent } from '../../components/ui/WellnessCard';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';
import { ChevronDownIcon, ChevronUpIcon, PlayIcon, BookOpenIcon, UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const CoachingPage: React.FC = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const navigate = useNavigate();

  const whyCoachingReasons = [
    {
      icon: '🌍',
      title: 'The Global Health Crisis Demands It',
      description: 'Chronic disease accounts for 74% of all deaths globally (WHO). Most are lifestyle-related and preventable—not medical issues, but behavioral ones.',
      highlight: 'People don\'t need more information. They need support, accountability, and transformation.'
    },
    {
      icon: '📈',
      title: 'Explosive Market Growth',
      description: 'The global wellness economy is worth $5.6 trillion, projected to reach $8.5 trillion by 2027. Health coaching is a rapidly growing $7+ billion industry.',
      highlight: 'Coaching is becoming mainstream—just like personal trainers were in the 1990s.'
    },
    {
      icon: '🧠',
      title: 'Neuroscience of Behavior Change',
      description: 'Wellness coaches use motivational interviewing, habit formation, and positive psychology—tools that actually work for long-term change.',
      highlight: 'As AI replaces many jobs, human-to-human coaching becomes more valuable, not less.'
    },
    {
      icon: '👩‍💼',
      title: 'Flexible, Purpose-Driven, Scalable',
      description: 'Work from anywhere, with clients around the world. Design your career and make a meaningful impact.',
      highlight: 'Coaches don\'t just make a living. They make a difference.'
    },
    {
      icon: '🚀',
      title: 'Future-Proof and AI-Resistant',
      description: 'AI can\'t coach human emotion, hold space, or build trust. Wellness coaching combines health, tech, and humanity.',
      highlight: 'It\'s not just a job. It\'s a mission, a movement, and your future.'
    }
  ];

  const modules = [
    {
      number: 1,
      title: 'Introduction to Wellness Coaching & Holistic Health',
      duration: '45 min',
      description: 'Define wellness coaching, explore holistic health, and understand the role of a coach.',
      learningOutcomes: [
        'Define wellness coaching and how it differs from other fields',
        'Understand the 7 dimensions of holistic health',
        'Identify the core roles and mindset of a coach',
        'Begin developing your own wellness vision'
      ],
      exercises: [
        'Reflection: Time you made a healthy change',
        'Wellness Wheel: Rate yourself 1-10 in each dimension',
        'Coach vs. Expert: Language that empowers vs. fixes'
      ]
    },
    {
      number: 2,
      title: 'Physical Wellness – Movement, Exercise & Sleep',
      duration: '50 min',
      description: 'Explore movement, sleep, and recovery as the foundation of physical wellness.',
      learningOutcomes: [
        'Understand the benefits of movement and application',
        'Create a weekly activity and recovery schedule',
        'Identify sleep habits that improve performance and mood'
      ],
      exercises: [
        'Movement Reflection: Track energy after different activities',
        'Sleep Audit: Assess routine and identify 1-2 changes',
        'Mini-Movement Challenge: Choose one daily movement for 7 days'
      ]
    },
    {
      number: 3,
      title: 'Nutrition & Healthy Eating Habits',
      duration: '40 min',
      description: 'Break down practical nutrition strategies for sustained energy and mental clarity.',
      learningOutcomes: [
        'Understand core nutrition concepts',
        'Apply mindful eating techniques',
        'Create simple, nourishing meals'
      ],
      exercises: [
        'Food Journal: Track 3 days of meals + mood/energy',
        'Mindful Meal Practice: Eat without distractions',
        'Grocery Makeover: Choose 3 healthy swaps'
      ]
    },
    {
      number: 4,
      title: 'Mental & Emotional Well-Being',
      duration: '55 min',
      description: 'Explore how thoughts, emotions, and psychological patterns influence well-being.',
      learningOutcomes: [
        'Define mental and emotional wellness',
        'Identify mindset and thought patterns',
        'Use coaching questions to explore emotional barriers',
        'Support resilience-building practices'
      ],
      exercises: [
        'Mindset Reflection: Reframe fixed beliefs into growth statements',
        'Emotion Log: Track mood for 5 days',
        'Resilience Map: List people, beliefs, and practices that help you bounce back'
      ]
    },
    {
      number: 5,
      title: 'Stress Management & Mindfulness',
      duration: '48 min',
      description: 'Learn to identify stress, manage it proactively, and use mindfulness to stay grounded.',
      learningOutcomes: [
        'Understand the biology and psychology of stress',
        'Recognize personal stress patterns and triggers',
        'Apply mindfulness techniques for regulation and recovery',
        'Create daily stress-reduction and mindfulness habits'
      ],
      exercises: [
        'Stress Inventory: List top 5 stressors and what you can control',
        'Breathwork Practice: 4-7-8 breathing for 7 days',
        'Mindfulness Log: Track awareness during routine activities'
      ]
    },
    {
      number: 6,
      title: 'Healthy Habits & Behavior Change',
      duration: '52 min',
      description: 'Explore the psychology of habit formation and how to make lasting change stick.',
      learningOutcomes: [
        'Understand the habit loop and behavior formation',
        'Identify and analyze current habit patterns',
        'Create and implement small wellness habits',
        'Troubleshoot barriers to lasting behavior change'
      ],
      exercises: [
        'Habit Awareness: Break down unhelpful habit into cue-routine-reward',
        'Start Tiny Challenge: Pick one tiny health habit for 7 days',
        'If-Then Planning: Write 3 plans for likely challenges'
      ]
    },
    {
      number: 7,
      title: 'Self-Coaching & Long-Term Motivation',
      duration: '45 min',
      description: 'Learn to coach yourself for sustained motivation, resilience, and accountability.',
      learningOutcomes: [
        'Define self-coaching and its importance',
        'Use self-coaching tools for clarity and motivation',
        'Reframe obstacles as learning opportunities',
        'Build momentum using tracking and self-compassion'
      ],
      exercises: [
        'Weekly Reflection Ritual: 4 simple journal questions',
        'Reframe a Recent Setback: Turn challenge into lesson',
        'Self-Coaching Checklist: 3 daily check-in questions'
      ]
    },
    {
      number: 8,
      title: 'Capstone – Personal Wellness Plan',
      duration: '60 min',
      description: 'Integrate everything into a living, breathing Personal Wellness Plan.',
      learningOutcomes: [
        'Clarify your personal wellness vision',
        'Set meaningful, realistic goals across core dimensions',
        'Design systems and routines for follow-through',
        'Commit to long-term wellness with confidence'
      ],
      exercises: [
        'Wellness Vision Statement: One paragraph that excites you',
        'Pillar Goals Chart: 1-2 habits per wellness area',
        'Weekly Success Ritual: 15-minute check-in process'
      ]
    }
  ];

  return (
    <ParallaxContainer
      backgroundGradient="from-purple-50 via-blue-50 to-indigo-100"
      className="min-h-screen"
    >
      {/* Hero Section */}
      <ParallaxLayer speed={0.5} className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-4xl">🌟</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Wellness Coaching
              </span>
              <br />
              <span className="text-3xl md:text-5xl">Masterclass</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform lives through the art and science of wellness coaching. 
              Learn evidence-based techniques to guide lasting behavior change.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                Start Learning
              </motion.button>
              
              <motion.button
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-50 transition-all flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                Course Overview
              </motion.button>
            </div>
          </motion.div>
        </div>
      </ParallaxLayer>

      {/* Why Wellness Coaching Section */}
      <ParallaxLayer speed={0.3} className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Wellness Coaching?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The world needs more coaches. Here's why this is the perfect time to start.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyCoachingReasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <WellnessCard className="h-full hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="text-4xl mb-4">{reason.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-grow">
                      {reason.description}
                    </p>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-800 italic">
                        "{reason.highlight}"
                      </p>
                    </div>
                  </CardContent>
                </WellnessCard>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxLayer>

      {/* Course Modules Section */}
      <ParallaxLayer speed={0.4} className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              8-Module Masterclass
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Self-paced, interactive learning with practical exercises and real-world application.
            </p>
          </motion.div>

          <div className="space-y-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.number}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <WellnessCard className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedModule(expandedModule === module.number ? null : module.number)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                            {module.number}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {module.title}
                            </h3>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                        </div>
                        {expandedModule === module.number ? (
                          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedModule === module.number && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 pt-0 border-t border-gray-100">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                  <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
                                  Learning Outcomes
                                </h4>
                                <ul className="space-y-2">
                                  {module.learningOutcomes.map((outcome, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start">
                                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                                      {outcome}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                  <PlayIcon className="w-5 h-5 mr-2 text-purple-600" />
                                  Interactive Exercises
                                </h4>
                                <ul className="space-y-2">
                                  {module.exercises.map((exercise, idx) => (
                                    <li key={idx} className="text-gray-600 text-sm flex items-start">
                                      <span className="text-purple-500 mr-2 mt-0.5">◆</span>
                                      {exercise}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            
                            <div className="mt-6 flex justify-center">
                              <motion.button
                                onClick={() => navigate(`/coaching/module/${module.number}`)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <span>Go to Module</span>
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </WellnessCard>
              </motion.div>
            ))}
          </div>
        </div>
      </ParallaxLayer>

      {/* Call to Action */}
      <ParallaxLayer speed={0.6} className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <WellnessCard className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardContent className="p-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Transform Lives?
                </h2>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Join thousands of wellness professionals who are making a real difference. 
                  Your journey to becoming a certified wellness coach starts here.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button
                    className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Enroll Now
                  </motion.button>
                  
                  <motion.button
                    className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Free Preview
                  </motion.button>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>
        </div>
      </ParallaxLayer>
    </ParallaxContainer>
  );
};

export default CoachingPage;