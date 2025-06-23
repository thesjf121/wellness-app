import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module6Page: React.FC = () => {
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
      title: 'Part 1: Understanding the Habit Loop & Behavior Formation',
      content: `Habits are the foundation of lasting change. Understanding how they work gives you the power to design better ones.

The Science of Habit Formation:

What Are Habits?
• Automatic behaviors triggered by environmental cues
• Neurological patterns stored in the basal ganglia
• Energy-saving mechanisms that free up mental resources
• 40-45% of our daily actions are habits, not conscious decisions

The Habit Loop (Charles Duhigg):

1. Cue (Trigger):
   • Environmental signal that initiates the behavior
   • Can be time, location, emotional state, other people, or preceding action
   • Brain recognizes this as a signal to switch to autopilot

2. Routine (Behavior):
   • The actual behavior or action you take
   • Can be physical, mental, or emotional
   • Becomes more automatic with repetition

3. Reward (Benefit):
   • The neurological payoff your brain receives
   • Satisfies a craving and releases feel-good chemicals
   • Teaches your brain this loop is worth remembering

The Neuroplasticity Factor:
• Brain pathways strengthen with repetition
• New habits take 18-254 days to form (average: 66 days)
• Complexity of habit affects formation time
• Consistency matters more than perfection

Types of Habits:

Keystone Habits:
• Habits that trigger positive changes in other areas
• Examples: Exercise, meditation, meal planning
• Create a cascade of good behaviors
• Focus on these for maximum impact

Habit Stacking:
• Linking new habits to existing ones
• Formula: "After I [current habit], I will [new habit]"
• Leverages existing neural pathways
• Makes new habits easier to remember

Environmental Design:
• Your environment shapes your habits
• Make good habits obvious and easy
• Make bad habits invisible and difficult
• Design your space to support your goals

The Role of Identity:

Identity-Based Habits:
Instead of outcome-based goals, focus on identity:
• "I am someone who exercises" vs. "I want to lose weight"
• "I am a healthy eater" vs. "I want to eat better"
• Each habit is a vote for the type of person you want to become

The Two-Step Process:
1. Decide who you want to be
2. Prove it with small wins

Common Habit Formation Mistakes:
• Starting too big
• Relying on motivation instead of systems
• Not tracking progress
• All-or-nothing thinking
• Focusing on outcomes instead of process
• Trying to change everything at once`,
      learningOutcomes: [
        'Understand the habit loop and how behaviors become automatic',
        'Identify different types of habits and their formation processes',
        'Apply identity-based thinking to habit development'
      ],
      exercise: {
        title: 'Habit Loop Analysis',
        prompt: 'Choose one habit you want to change (break or build) and analyze it:\n\n**Current Habit to Break:**\nHabit: ________________\nCue: ________________\nRoutine: ________________\nReward: ________________\nWhat craving does this satisfy: ________________\n\n**New Habit to Build:**\nDesired Identity: "I am someone who ________________"\nNew Habit: ________________\nCue I will use: ________________\nReward I will give myself: ________________\nHow I will make it obvious: ________________\nHow I will make it easy: ________________\n\nStart with the smallest possible version of your new habit.',
        type: 'analysis'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Identifying & Analyzing Current Habit Patterns',
      content: `Before building new habits, we need to understand the patterns that already exist in your life.

Habit Awareness Exercise:

The first step to changing habits is becoming aware of them. Most habits operate below conscious awareness.

Daily Habit Audit:
Track your automatic behaviors for 2-3 days without trying to change them:

Morning Habits:
• What do you do within the first hour of waking?
• What triggers each action?
• Which habits serve you well?
• Which habits don't align with your goals?

Work/Productivity Habits:
• How do you start your workday?
• What do you do when you feel overwhelmed?
• How do you handle breaks?
• What are your procrastination patterns?

Health Habits:
• Eating patterns and triggers
• Movement and exercise routines
• Sleep preparation rituals
• Stress response habits

Evening Habits:
• How do you transition from work?
• Screen time patterns
• Bedtime routines
• Ways you unwind

Categorizing Your Habits:

Helpful Habits (Keep These):
• Support your goals and values
• Make you feel energized
• Move you toward who you want to become
• Examples: Morning exercise, reading, meal prep

Neutral Habits (Could Optimize):
• Neither help nor hurt significantly
• Could be upgraded or replaced
• Examples: Route to work, morning coffee routine

Harmful Habits (Need to Change):
• Work against your goals
• Drain your energy
• Don't align with your values
• Examples: Excessive scrolling, stress eating

The 5 Whys Technique:
For habits you want to change, dig deeper:

1. Why do I do this habit?
2. Why is that important to me?
3. Why does that matter?
4. Why do I feel that way?
5. Why is that significant?

This reveals the underlying need your habit is trying to meet.

Trigger Mapping:

Internal Triggers:
• Emotions (boredom, stress, excitement)
• Physical sensations (hunger, fatigue)
• Thoughts and mental states
• Energy levels

External Triggers:
• Time of day
• Locations
• Other people
• Objects in your environment
• Preceding events

Habit Stacking Opportunities:
Look for existing strong habits you can build upon:
• "After I pour my morning coffee, I will..."
• "After I sit down at my desk, I will..."
• "After I put on my pajamas, I will..."

The Replacement Strategy:
Instead of just trying to eliminate bad habits, replace them:
• Keep the same cue and reward
• Change the routine
• Example: Cue (stress) → Old routine (scroll phone) → New routine (5-minute walk) → Reward (mental break)`,
      learningOutcomes: [
        'Conduct a personal audit of existing habit patterns',
        'Categorize habits as helpful, neutral, or harmful',
        'Identify triggers and opportunities for habit stacking'
      ],
      exercise: {
        title: 'Personal Habit Inventory',
        prompt: 'Complete this comprehensive habit analysis:\n\n**MORNING HABITS (First 2 hours awake):**\n1. ________________\n2. ________________\n3. ________________\n\n**STRESS RESPONSE HABITS:**\nWhen stressed, I usually: ________________\nThis makes me feel: ________________\nA better alternative would be: ________________\n\n**EVENING HABITS (Last 2 hours before bed):**\n1. ________________\n2. ________________\n3. ________________\n\n**HABIT CATEGORIZATION:**\nHelpful habits to keep:\n• ________________\n• ________________\n\nHarmful habits to change:\n• ________________\n• ________________\n\n**STRONGEST HABIT TO BUILD ON:**\nMy most consistent daily habit is: ________________\nI could stack this new habit after it: ________________',
        type: 'inventory'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Creating & Implementing Small Wellness Habits',
      content: `Small habits compound into massive results. The key is starting so small you can't fail, then building momentum.

The 2-Minute Rule:
When starting a new habit, it should take less than 2 minutes to do:
• "Read before bed" becomes "Read one page"
• "Exercise daily" becomes "Put on workout clothes"
• "Eat healthier" becomes "Eat one piece of fruit"
• "Meditate" becomes "Take three deep breaths"

Scaling Your Habits:

Phase 1: Show Up (Weeks 1-2)
• Focus on consistency over performance
• Just do the bare minimum version
• Build the neural pathway
• Celebrate showing up

Phase 2: Build Volume (Weeks 3-6)
• Gradually increase duration or intensity
• Still keep it manageable
• Focus on not breaking the chain
• Track your progress

Phase 3: Fine-tune (Weeks 7+)
• Optimize for efficiency and enjoyment
• Add complexity if desired
• Make it part of your identity
• Help others develop the same habit

Habit Design Framework:

Make It Obvious:
• Implementation intention: "I will [behavior] at [time] in [location]"
• Habit stacking: "After I [current habit], I will [new habit]"
• Environmental design: Put cues in your environment
• Visual reminders and prompts

Make It Attractive:
• Bundle tempting activities with beneficial ones
• Join groups where your desired behavior is normal
• Create anticipation and excitement
• Highlight benefits, not just features

Make It Easy:
• Reduce friction for good habits
• Prepare your environment in advance
• Use the 2-minute rule
• Prime your environment
• Master decisive moments

Make It Satisfying:
• Immediate rewards after completion
• Track your progress visibly
• Celebrate small wins
• Use accountability partners
• Focus on how the habit makes you feel

Wellness Habit Ideas:

Micro Habits (30 seconds - 2 minutes):
• Drink a glass of water upon waking
• Do 5 jumping jacks after using the bathroom
• Take 3 deep breaths before checking phone
• Put one piece of fruit in your lunch
• Write down one thing you're grateful for

Mini Habits (2-10 minutes):
• 5-minute morning walk
• Prepare tomorrow's healthy snack
• Do a 2-minute body scan
• Write 3 sentences in a journal
• Stretch for 5 minutes before bed

Building Habits (10-30 minutes):
• 15-minute morning routine
• Meal prep for one day
• 20-minute evening wind-down
• Read 10 pages of a wellness book
• Take a mindful lunch break

Troubleshooting Common Obstacles:

"I Keep Forgetting":
→ Use implementation intentions
→ Set phone reminders initially
→ Stack on existing habits
→ Create visual cues

"I Don't Have Time":
→ Start smaller (2-minute rule)
→ Look for "dead time" opportunities
→ Combine with existing activities
→ Question your priorities

"I'm Not Motivated":
→ Focus on systems, not goals
→ Lower the bar for success
→ Track input, not just output
→ Remember your why

"It's Too Hard":
→ Make it easier, not yourself stronger
→ Remove friction from environment
→ Get an accountability partner
→ Simplify the habit

"I Keep Quitting":
→ Expect imperfection, plan for it
→ Never miss twice in a row
→ Get back on track immediately
→ Focus on identity, not outcomes`,
      learningOutcomes: [
        'Apply the 2-minute rule to create sustainable small habits',
        'Use the four-step habit design framework',
        'Troubleshoot common habit formation obstacles'
      ],
      exercise: {
        title: 'Tiny Habit Challenge',
        prompt: 'Design and commit to ONE tiny habit for the next 7 days:\n\n**MY TINY HABIT:**\nAfter I ________________ (existing habit),\nI will ________________ (new tiny habit),\nTo celebrate, I will ________________ (immediate reward).\n\n**MAKE IT OBVIOUS:**\nVisual cue I\'ll use: ________________\nWhere I\'ll do it: ________________\n\n**MAKE IT EASY:**\nIf I only had 30 seconds, I would: ________________\nHow I\'ll prepare my environment: ________________\n\n**DAILY TRACKING:**\n□ Day 1: Did it _____ Felt _____\n□ Day 2: Did it _____ Felt _____\n□ Day 3: Did it _____ Felt _____\n□ Day 4: Did it _____ Felt _____\n□ Day 5: Did it _____ Felt _____\n□ Day 6: Did it _____ Felt _____\n□ Day 7: Did it _____ Felt _____\n\n**SUCCESS CRITERIA:**\nI\'ll consider this successful if I do it _____ out of 7 days.\n\nRemember: Aim for consistency, not perfection!',
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
              Module 6: Healthy Habits & Behavior Change
            </h1>
            <p className="text-lg text-gray-600">
              Explore the psychology of habit formation and how to make lasting change stick.
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
            onClick={() => navigate('/coaching/module/5')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/7')}
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

export default Module6Page;