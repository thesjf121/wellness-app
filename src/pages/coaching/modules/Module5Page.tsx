import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module5Page: React.FC = () => {
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
      title: 'Part 1: Understanding the Biology & Psychology of Stress',
      content: `Stress is a natural, adaptive response designed to protect us. Understanding how it works helps us manage it more effectively.

The Stress Response System:

Fight-or-Flight Response:
When your brain perceives a threat (real or imagined), it triggers an immediate response:

1. Hypothalamus signals alarm
2. Sympathetic nervous system activates
3. Adrenal glands release stress hormones
4. Body prepares for action

Physical Changes During Stress:
• Heart rate increases (pumps blood to muscles)
• Breathing becomes rapid and shallow
• Muscles tense (ready for action)
• Digestion slows (energy redirected)
• Blood sugar rises (fuel for muscles)
• Pupils dilate (enhanced vision)
• Sweating increases (cooling system)

Stress Hormones and Their Effects:

Cortisol (The Primary Stress Hormone):
• Released by adrenal glands
• Increases blood sugar
• Suppresses immune system
• Affects memory and learning
• Influences mood and motivation

Adrenaline (Epinephrine):
• Immediate energy boost
• Increases heart rate and blood pressure
• Heightens alertness
• Temporary superhuman strength

The Problem with Chronic Stress:
Modern life triggers stress response frequently, but we rarely need to "fight or flee." This creates:

Physical Problems:
• Weakened immune system
• Digestive issues
• Sleep disturbances
• Muscle tension and pain
• Cardiovascular strain

Mental/Emotional Problems:
• Anxiety and worry
• Depression and mood swings
• Difficulty concentrating
• Memory problems
• Irritability and anger

Types of Stress:

Acute Stress:
• Short-term, intense
• Specific trigger
• Body recovers quickly
• Can be beneficial (eustress)

Chronic Stress:
• Long-term, ongoing
• Multiple triggers
• Body stays activated
• Always harmful

Eustress vs. Distress:
• Eustress: Positive stress that motivates and energizes
• Distress: Negative stress that overwhelms and depletes

The Stress-Performance Connection:
Some stress improves performance, but too much impairs it. Finding your optimal stress level is key to peak performance without burnout.`,
      learningOutcomes: [
        'Understand the biology and psychology of stress responses',
        'Identify the difference between acute and chronic stress',
        'Recognize how stress affects physical and mental health'
      ],
      exercise: {
        title: 'Personal Stress Response Assessment',
        prompt: 'Reflect on your stress response patterns:\n\n1. What are your most common stress triggers?\n2. How does stress show up in your body? (tension, headaches, stomach issues, etc.)\n3. What emotions do you experience when stressed?\n4. How do you typically cope with stress?\n5. When has stress been helpful vs. harmful in your life?\n\nNotice patterns without judgment - this awareness is the first step to better stress management.',
        type: 'assessment'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Recognizing Personal Stress Patterns & Triggers',
      content: `Becoming aware of your unique stress patterns empowers you to intervene before stress becomes overwhelming.

Identifying Your Stress Triggers:

External Triggers:
• Work deadlines and pressure
• Relationship conflicts
• Financial concerns
• Health issues
• Major life changes
• Traffic and commuting
• Technology and information overload
• Social situations
• Family responsibilities

Internal Triggers:
• Perfectionism and high expectations
• Negative self-talk
• Worry about the future
• Ruminating on the past
• Comparing yourself to others
• Fear of failure or rejection
• Imposter syndrome
• Need for control

Early Warning Signs of Stress:

Physical Signs:
• Muscle tension (neck, shoulders, jaw)
• Headaches or fatigue
• Changes in appetite
• Sleep difficulties
• Digestive issues
• Frequent illness
• Restlessness or fidgeting

Emotional Signs:
• Irritability or short temper
• Feeling overwhelmed
• Anxiety or worry
• Mood swings
• Feeling disconnected
• Loss of motivation
• Sense of dread

Behavioral Signs:
• Procrastination or avoidance
• Increased caffeine, alcohol, or substance use
• Social withdrawal
• Nervous habits (nail-biting, hair-pulling)
• Changes in eating patterns
• Decreased productivity
• Snapping at others

Cognitive Signs:
• Racing thoughts
• Difficulty concentrating
• Forgetfulness
• Indecisiveness
• Negative thinking patterns
• Catastrophizing
• Mind going blank

The Stress Spiral:
Understanding how stress builds can help you intervene early:

1. Trigger occurs
2. Initial stress response
3. If not addressed, stress accumulates
4. Warning signs appear
5. Without intervention, stress intensifies
6. Overwhelm and potential burnout

Breaking the Pattern:
The earlier you catch stress in this cycle, the easier it is to manage. Learning your personal early warning signs is crucial.

Stress vs. Challenge:
Not all pressure is harmful. Learn to distinguish between:
• Motivating challenges that help you grow
• Overwhelming stress that depletes you

Creating Your Stress Profile:
Document your patterns to increase awareness:
• Most common triggers
• Physical sensations you experience
• Emotional responses
• Behavioral changes
• Time patterns (when stress peaks)
• Situations that help vs. harm`,
      learningOutcomes: [
        'Identify personal stress triggers and patterns',
        'Recognize early warning signs of stress buildup',
        'Understand the difference between helpful challenge and harmful stress'
      ],
      exercise: {
        title: 'Stress Trigger Inventory',
        prompt: 'Complete this stress inventory:\n\n**Top 5 Stress Triggers:**\n1. ________________\n2. ________________\n3. ________________\n4. ________________\n5. ________________\n\n**For each trigger, note:**\n• Can I control this? (Yes/No/Partially)\n• How does it affect me physically?\n• What emotions come up?\n• How do I usually respond?\n\n**Early Warning System:**\nList 3 early signs that tell you stress is building:\n1. ________________\n2. ________________\n3. ________________\n\nPost this list somewhere visible as your personal stress radar system.',
        type: 'inventory'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Mindfulness & Stress-Reduction Techniques',
      content: `Mindfulness and proven stress-reduction techniques can help you respond to stress rather than react to it.

Understanding Mindfulness:

What Mindfulness Is:
• Present-moment awareness
• Observing thoughts and feelings without judgment
• Accepting what is while choosing how to respond
• Being fully engaged in current experience

What Mindfulness Is Not:
• Emptying your mind
• Stopping thoughts
• Always feeling calm
• Avoiding difficult emotions
• A religious practice (though it can be spiritual)

Benefits of Mindfulness for Stress:
• Activates the relaxation response
• Reduces cortisol levels
• Improves emotional regulation
• Increases self-awareness
• Builds resilience
• Enhances focus and clarity

Breathing Techniques for Immediate Relief:

4-7-8 Breathing (Relaxation Breath):
1. Exhale completely
2. Inhale through nose for 4 counts
3. Hold breath for 7 counts
4. Exhale through mouth for 8 counts
5. Repeat 3-4 cycles

Box Breathing (Navy SEAL technique):
1. Inhale for 4 counts
2. Hold for 4 counts
3. Exhale for 4 counts
4. Hold empty for 4 counts
5. Repeat 4-8 cycles

Belly Breathing:
1. Place one hand on chest, one on belly
2. Breathe so only the bottom hand moves
3. Inhale slowly through nose
4. Exhale slowly through mouth
5. Continue for 5-10 minutes

Quick Mindfulness Practices:

STOP Technique (Emergency Mindfulness):
• Stop what you're doing
• Take a breath
• Observe your experience
• Proceed with awareness

5-4-3-2-1 Grounding:
• 5 things you can see
• 4 things you can touch
• 3 things you can hear
• 2 things you can smell
• 1 thing you can taste

Body Scan (2-minute version):
• Start at the top of your head
• Notice each part of your body
• Breathe into areas of tension
• Move systematically to your toes

Longer Stress-Reduction Practices:

Progressive Muscle Relaxation:
1. Tense and release each muscle group
2. Hold tension for 5 seconds
3. Release and notice the relaxation
4. Work from head to toe
5. End with whole-body relaxation

Loving-Kindness Meditation:
1. Start with sending love to yourself
2. Extend to loved ones
3. Include neutral people
4. Include difficult people
5. Send to all beings everywhere

Walking Meditation:
• Walk slowly and deliberately
• Focus on the sensation of each step
• Notice your surroundings mindfully
• Return attention when mind wanders

Creating Daily Mindfulness Habits:

Micro-Practices (1-3 minutes):
• Mindful first sips of morning coffee
• Three conscious breaths before checking phone
• Mindful handwashing
• Gratitude pause before meals

Regular Practice (10-20 minutes):
• Morning meditation
• Evening body scan
• Mindful movement (yoga, tai chi)
• Journaling with awareness

Integration Throughout Day:
• Mindful transitions between activities
• Conscious breathing during waiting times
• Present-moment awareness during routine tasks
• Regular check-ins with your stress level`,
      learningOutcomes: [
        'Apply mindfulness techniques for immediate stress relief',
        'Practice breathing exercises for nervous system regulation',
        'Develop daily mindfulness habits for stress prevention'
      ],
      exercise: {
        title: '7-Day Stress-Reduction Challenge',
        prompt: 'Choose ONE technique to practice daily for 7 days:\n\n**Options:**\n□ 4-7-8 breathing (3 cycles, twice daily)\n□ 5-minute body scan (morning or evening)\n□ STOP technique (use whenever stressed)\n□ Mindful walking (10 minutes daily)\n□ Gratitude breathing (3 things while taking 3 deep breaths)\n\n**Daily Practice Log:**\nDay 1: ________________\nDay 2: ________________\nDay 3: ________________\nDay 4: ________________\nDay 5: ________________\nDay 6: ________________\nDay 7: ________________\n\n**Reflection:**\nAfter 7 days, note:\n• What changes did you notice?\n• When was it most helpful?\n• How will you continue this practice?',
        type: 'challenge'
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
              Module 5: Stress Management & Mindfulness
            </h1>
            <p className="text-lg text-gray-600">
              Learn to identify stress, manage it proactively, and use mindfulness to stay grounded.
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
            onClick={() => navigate('/coaching/module/4')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/6')}
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

export default Module5Page;