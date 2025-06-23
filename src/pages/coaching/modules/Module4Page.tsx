import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module4Page: React.FC = () => {
  const navigate = useNavigate();
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const markSectionComplete = (sectionId: string) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections([...completedSections, sectionId]);
    }
  };

  const sections = [
    {
      id: 'part1',
      title: 'Part 1: Understanding Mental & Emotional Wellness',
      content: `Mental and emotional wellness form the foundation of how we experience and navigate life.

Defining Mental Wellness:
• Cognitive functioning: Clear thinking, learning, memory
• Emotional regulation: Managing feelings effectively
• Stress resilience: Bouncing back from challenges
• Positive mindset: Optimism with realistic thinking
• Self-awareness: Understanding your patterns and triggers

The Mind-Body Connection:
• Thoughts trigger physical responses (stress → muscle tension)
• Emotions manifest in the body (anxiety → rapid heartbeat)
• Physical state affects mood (exercise → endorphins)
• Chronic stress impacts immune function
• Positive emotions boost healing and longevity

Emotional Intelligence Components:
1. Self-awareness: Recognizing your emotions
2. Self-regulation: Managing emotional responses
3. Motivation: Using emotions to achieve goals
4. Empathy: Understanding others' emotions
5. Social skills: Navigating relationships effectively

Common Mental Health Challenges:
• 1 in 5 adults experience mental health issues yearly
• Anxiety: Excessive worry about future
• Depression: Persistent sadness, loss of interest
• Stress: Feeling overwhelmed by demands
• Burnout: Emotional, physical, mental exhaustion

Remember: All emotions are valid messengers. The goal isn't to be happy all the time, but to understand and work with your emotions constructively.`,
      learningOutcomes: [
        'Define mental and emotional wellness comprehensively',
        'Understand the mind-body connection',
        'Identify components of emotional intelligence'
      ],
      exercise: {
        title: 'Emotion Check-In Practice',
        prompt: 'Three times today, pause and ask yourself:\n• What am I feeling right now?\n• Where do I feel it in my body?\n• What triggered this feeling?\n• What is this emotion trying to tell me?\n\nNo judgment - just notice and name.',
        type: 'awareness'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Identifying & Shifting Limiting Thought Patterns',
      content: `Our thoughts shape our reality. Let's identify and transform patterns that hold you back.

Common Cognitive Distortions:

All-or-Nothing Thinking:
❌ "I'm a total failure"
✅ "I'm learning and growing"

Mind Reading:
❌ "They think I'm stupid"
✅ "I don't know what they think"

Catastrophizing:
❌ "This is the worst thing ever"
✅ "This is challenging but manageable"

Should Statements:
❌ "I should be perfect"
✅ "I'm doing my best"

Personalization:
❌ "It's all my fault"
✅ "I'm responsible for my part"

The ABC Model of Thoughts:
A - Activating Event (what happened)
B - Beliefs/Thoughts (your interpretation)
C - Consequences (emotions and behaviors)

We can't always control A, but we can change B to improve C.

Thought Reframing Process:
1. Notice the thought (awareness)
2. Question its accuracy (is this 100% true?)
3. Consider alternatives (what else could be true?)
4. Choose a balanced perspective
5. Test the new thought in action

Growth vs. Fixed Mindset:
Fixed Mindset → Growth Mindset
"I can't do this" → "I can't do this yet"
"I'm not good at..." → "I'm learning to..."
"This is too hard" → "This will help me grow"
"I failed" → "I learned what doesn't work"
"I'm not smart enough" → "I can develop my abilities"

Creating New Neural Pathways:
• Thoughts are habits that can be changed
• Repetition creates new pathways
• Practice self-compassion during change
• Celebrate small shifts
• Be patient with the process`,
      learningOutcomes: [
        'Identify personal cognitive distortions',
        'Apply the ABC model to thought patterns',
        'Practice reframing limiting beliefs into growth statements'
      ],
      exercise: {
        title: 'Mindset Makeover',
        prompt: 'Write down 3 fixed mindset beliefs you hold:\n\n1. _________________\n2. _________________\n3. _________________\n\nNow reframe each into a growth mindset statement. Post these where you\'ll see them daily. Practice saying them aloud each morning.',
        type: 'reframing'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Building Emotional Resilience & Well-Being Practices',
      content: `Resilience isn't about being tough - it's about bouncing back and growing through challenges.

The Resilience Framework:

1. Acceptance: Acknowledge what is without resistance
   • "This is my current reality"
   • Doesn't mean liking or approving
   • Reduces energy spent fighting reality

2. Adaptation: Adjust your approach as needed
   • Flexibility over rigidity
   • Multiple strategies for challenges
   • Learning from what doesn't work

3. Growth: Find meaning and learning in challenges
   • "What can this teach me?"
   • Post-traumatic growth is real
   • Challenges build strength

4. Connection: Lean on support systems
   • Vulnerability builds bonds
   • Asking for help is strength
   • We heal in community

5. Self-compassion: Treat yourself with kindness
   • Talk to yourself like a good friend
   • Acknowledge common humanity
   • Practice mindful awareness

Daily Practices for Emotional Well-Being:

Morning:
• Gratitude practice (3 specific things)
• Set positive intention
• Mindful breathing (5 minutes)

Midday:
• Emotion check-in
• Movement break
• Connect with someone

Evening:
• Reflect on wins (big or small)
• Journal thoughts/feelings
• Relaxation practice

Building Your Resilience Toolkit:

Physical: Exercise, sleep, nutrition
Mental: Meditation, learning, puzzles
Emotional: Journaling, therapy, art
Social: Friends, family, support groups
Spiritual: Nature, prayer, purpose work

The Power of Self-Compassion:

Self-Compassion Break:
1. "This is a moment of struggle" (mindfulness)
2. "Struggle is part of being human" (common humanity)
3. "May I be kind to myself" (self-kindness)

Remember: Resilience is built through practice, not perfection. Every challenge is an opportunity to strengthen your emotional well-being.`,
      learningOutcomes: [
        'Understand the components of resilience',
        'Develop a personal resilience toolkit',
        'Practice self-compassion techniques'
      ],
      exercise: {
        title: 'Resilience Map',
        prompt: 'Create your personal resilience map. Draw or list:\n\n• People who support you\n• Activities that restore you\n• Beliefs that sustain you\n• Practices that ground you\n• Places that calm you\n\nIdentify 1-2 areas to strengthen. What specific action will you take this week?',
        type: 'mapping'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/coaching')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Coaching Overview
          </button>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Module 4: Mental & Emotional Well-Being
            </h1>
            <p className="text-lg text-gray-600">
              Explore how thoughts, emotions, and psychological patterns influence well-being.
            </p>
            
            {/* Progress Indicator */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Module Progress</span>
                <span className="text-sm text-gray-600">
                  {completedSections.length} of {sections.length} parts completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(completedSections.length / sections.length) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <WellnessCard className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold flex items-center">
                        {completedSections.includes(section.id) && (
                          <CheckCircleIcon className="w-7 h-7 mr-3" />
                        )}
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-8">
                    {/* Main Content */}
                    <ModuleContent content={section.content} />

                    {/* Learning Outcomes */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        Learning Outcomes
                      </h3>
                      <ul className="space-y-3">
                        {section.learningOutcomes.map((outcome, idx) => (
                          <li key={idx} className="text-gray-700 flex items-start">
                            <span className="text-blue-600 mr-3 mt-1 text-lg">✓</span>
                            <span className="leading-relaxed">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exercise */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-lg">✍️</span>
                        </div>
                        {section.exercise.title}
                      </h3>
                      <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100">
                        <div className="text-gray-700 space-y-2">
                          {section.exercise.prompt.split('\n').map((line, idx) => (
                            line.trim() ? (
                              <p key={idx} className="leading-relaxed">
                                {line}
                              </p>
                            ) : null
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => markSectionComplete(section.id)}
                        className={`px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 ${
                          completedSections.includes(section.id)
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                        }`}
                        disabled={completedSections.includes(section.id)}
                      >
                        {completedSections.includes(section.id) ? (
                          <span className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Completed
                          </span>
                        ) : (
                          'Mark as Complete'
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </WellnessCard>
            </motion.div>
          ))}
        </div>

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex justify-between items-center"
        >
          <button
            onClick={() => navigate('/coaching/module/3')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/5')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center"
          >
            Next Module
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Module4Page;