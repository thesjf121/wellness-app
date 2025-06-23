import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, TrophyIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module8Page: React.FC = () => {
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
      title: 'Part 1: Clarifying Your Personal Wellness Vision',
      content: `Creating a compelling wellness vision is the foundation of lasting change. Your vision becomes your North Star, guiding decisions and inspiring action.

What Is a Wellness Vision?

Your wellness vision is:
• A clear picture of your ideal healthy life
• How you want to feel in your body and mind
• The lifestyle you want to live
• The person you want to become
• Your "why" for making healthy choices

Why Vision Matters:

Provides Direction:
• Helps you prioritize what matters most
• Guides daily decisions and choices
• Keeps you focused on long-term benefits
• Prevents getting lost in short-term challenges

Creates Motivation:
• Connects you to your deeper purpose
• Inspires action during difficult times
• Makes sacrifices feel worthwhile
• Generates emotional energy for change

Aligns Actions:
• Ensures your habits support your goals
• Helps you say no to things that don't serve you
• Creates coherence between values and behaviors
• Builds momentum toward meaningful outcomes

Elements of a Powerful Wellness Vision:

Physical Wellness Vision:
• How do you want to feel in your body?
• What activities do you want to be able to do?
• How do you want to look and feel each day?
• What physical goals inspire you?

Mental/Emotional Wellness Vision:
• How do you want to handle stress and challenges?
• What kind of mindset do you want to cultivate?
• How do you want to feel emotionally day-to-day?
• What mental qualities do you want to develop?

Social Wellness Vision:
• What kind of relationships do you want?
• How do you want to show up for others?
• What role do you want community to play?
• How do you want to contribute to others' wellness?

Spiritual Wellness Vision:
• What gives your life meaning and purpose?
• How do you want to connect with something greater?
• What values do you want to live by?
• What legacy do you want to create?

Environmental Wellness Vision:
• What kind of spaces support your wellness?
• How do you want to interact with nature?
• What does your ideal daily environment look like?
• How do you want to care for the planet?

Creating Your Vision:

The 5-Year Vision Exercise:
Imagine it's 5 years from now and you've achieved your wellness dreams:
• What does a typical day look like?
• How do you feel when you wake up?
• What activities fill your day?
• How do others describe you?
• What are you most proud of?

The Deathbed Test:
Looking back from the end of your life:
• What would you regret not doing for your health?
• How would you want to have lived?
• What would you be most grateful for?
• What wellness legacy would you want to leave?

Values-Based Vision:
• What are your core values?
• How does wellness support these values?
• What kind of person do these values call you to be?
• How can your wellness journey honor what matters most?

Making Your Vision Compelling:

Use All Your Senses:
• What will you see, hear, feel, smell, taste?
• Make it vivid and detailed
• Engage your emotions
• Create a mental movie, not just a concept

Make It Personal:
• Focus on what matters to YOU
• Don't copy someone else's vision
• Include your unique circumstances and desires
• Honor your personality and preferences

Write It in Present Tense:
Instead of: "I will be healthy"
Try: "I am energetic and vibrant"

Instead of: "I want to feel better"
Try: "I feel strong, confident, and alive"

Include the Why:
• Why does this vision matter to you?
• How will achieving it impact your life?
• What becomes possible when you live this way?
• Who benefits when you are at your best?

Vision Implementation:

Daily Connection:
• Read your vision each morning
• Visualize living it for 2-3 minutes
• Ask: "How can I honor my vision today?"
• Use it to guide choices and priorities

Regular Review:
• Update your vision as you grow
• Check if your actions align with your vision
• Celebrate progress toward your vision
• Adjust course when needed

Share Your Vision:
• Tell supportive people about your vision
• Find others with similar visions
• Let your vision inspire others
• Create accountability around your vision`,
      learningOutcomes: [
        'Create a compelling personal wellness vision across all dimensions',
        'Understand how vision drives motivation and decision-making',
        'Develop strategies for connecting with your vision daily'
      ],
      exercise: {
        title: 'Personal Wellness Vision Statement',
        prompt: 'Create your personal wellness vision statement:\n\n**VISION BRAINSTORM:**\nIn 5 years, I want to feel: ________________\nIn 5 years, I want to be able to: ________________\nThe person I want to become is: ________________\nWhat matters most to me about my health: ________________\n\n**MY WELLNESS VISION STATEMENT:**\n(Write 1-2 paragraphs in present tense, as if you\'re already living it)\n\n"I am ________________. My body feels ________________. Each day I ________________. I have the energy to ________________. People describe me as ________________. I am most proud that ________________. My wellness allows me to ________________. I feel ________________ because ________________."\n\n**VISION ANCHORING:**\nMy vision matters to me because: ________________\nWhen I live this vision, I can: ________________\nThe impact on my loved ones will be: ________________\n\n**DAILY PRACTICE:**\nI will connect with my vision by: ________________\nI will review and update it: ________________',
        type: 'visioning'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Setting Meaningful, Realistic Goals Across Core Dimensions',
      content: `Transform your wellness vision into actionable goals that are both inspiring and achievable. Learn to set goals that pull you forward rather than push you down.

From Vision to Goals:

Your vision describes WHERE you want to go.
Your goals describe HOW you'll get there.
Your systems describe WHAT you'll do daily.

The SMART-ER Goal Framework:

S - Specific: Clear and well-defined
M - Measurable: You can track progress
A - Achievable: Realistic given your resources
R - Relevant: Aligned with your vision and values
T - Time-bound: Has a clear deadline

E - Exciting: Motivates and inspires you
R - Reviewed: Regularly assessed and adjusted

Setting Goals Across Wellness Dimensions:

Physical Wellness Goals:
Examples:
• Exercise 4 times per week for 30 minutes
• Prepare healthy meals 5 days per week
• Get 7-8 hours of sleep nightly
• Walk 8,000 steps daily
• Complete a 5K run in 6 months

Mental/Emotional Wellness Goals:
Examples:
• Practice meditation 10 minutes daily
• Read 2 personal development books per month
• Journal 3 times per week
• Practice gratitude daily
• Complete stress management course

Social Wellness Goals:
Examples:
• Have dinner with friends twice monthly
• Join a wellness-focused group
• Practice active listening in all conversations
• Express appreciation to someone daily
• Attend family events consistently

Spiritual Wellness Goals:
Examples:
• Spend 20 minutes in nature daily
• Volunteer 4 hours monthly
• Practice daily reflection or prayer
• Live according to core values
• Create meaningful traditions

Environmental Wellness Goals:
Examples:
• Organize living space room by room
• Add plants to work and home spaces
• Reduce screen time in bedroom
• Create a dedicated meditation space
• Use environmentally friendly products

The 3-Tier Goal System:

Tier 1: Foundation Goals (Must-Do)
• Essential for basic wellness
• Non-negotiable daily/weekly practices
• Examples: Sleep 7+ hours, eat vegetables daily

Tier 2: Growth Goals (Want-To-Do)
• Build on foundation goals
• Stretch you beyond current comfort zone
• Examples: Run a 10K, learn meditation

Tier 3: Dream Goals (Love-To-Do)
• Exciting long-term aspirations
• Inspire and motivate you
• Examples: Complete triathlon, teach wellness

Goal-Setting Strategies:

Start Small, Think Big:
• Begin with foundation goals
• Build confidence and momentum
• Gradually add more challenging goals
• Always have some "easy wins"

Process vs. Outcome Goals:

Process Goals (What You Control):
• Exercise 4 times this week
• Meditate 10 minutes daily
• Eat vegetables with every meal
• Practice gratitude each morning

Outcome Goals (Results):
• Lose 20 pounds
• Run 5K in under 30 minutes
• Reduce stress levels
• Improve energy

Focus primarily on process goals for better motivation and success.

The 90-Day Sprint:
• Set 3-month focus periods
• Choose 2-3 main goals per sprint
• Review and adjust every 30 days
• Celebrate completion before setting new goals

Goal Breakdown Strategy:

Annual Goal: "Complete a half-marathon"

Quarterly Breakdown:
• Q1: Build base fitness (run/walk 3x/week)
• Q2: Increase distance (work up to 10K)
• Q3: Train for half-marathon distance
• Q4: Complete race and celebrate

Monthly Breakdown (Q1):
• Month 1: Establish routine, run/walk 20 minutes
• Month 2: Increase to 30 minutes consistently
• Month 3: Add one longer session weekly

Weekly Breakdown (Month 1):
• Week 1: 3 sessions, 15 minutes each
• Week 2: 3 sessions, 17 minutes each
• Week 3: 3 sessions, 20 minutes each
• Week 4: 3 sessions, 20 minutes + assess

Common Goal-Setting Mistakes:

Setting Too Many Goals:
• Focus on 2-3 major goals at once
• Master basics before adding complexity
• Quality over quantity

All-or-Nothing Thinking:
• 80% completion is success, not failure
• Progress is more important than perfection
• Adjust goals rather than abandoning them

Ignoring Your Why:
• Connect each goal to your deeper motivation
• Regularly revisit why the goal matters
• Make sure goals align with your values

Not Planning for Obstacles:
• Anticipate likely challenges
• Create if-then plans for common barriers
• Build flexibility into your approach

Comparison Trap:
• Your goals should serve YOUR vision
• Others' goals may not be right for you
• Focus on your own progress and growth`,
      learningOutcomes: [
        'Apply the SMART-ER framework to create meaningful goals',
        'Balance process and outcome goals effectively',
        'Use the 3-tier system to prioritize goals across wellness dimensions'
      ],
      exercise: {
        title: 'Personal Goal Setting Matrix',
        prompt: 'Create your personal wellness goals across all dimensions:\n\n**FOUNDATION GOALS (Must-Do Daily/Weekly):**\nPhysical: ________________\nMental/Emotional: ________________\nSocial: ________________\nSpiritual: ________________\nEnvironmental: ________________\n\n**GROWTH GOALS (90-Day Focus):**\n1. Goal: ________________\n   Why it matters: ________________\n   Success metric: ________________\n   Target date: ________________\n\n2. Goal: ________________\n   Why it matters: ________________\n   Success metric: ________________\n   Target date: ________________\n\n**DREAM GOAL (6-12 months):**\nGoal: ________________\nWhy this excites me: ________________\nFirst step I can take: ________________\n\n**OBSTACLE PLANNING:**\nMy biggest challenge will likely be: ________________\nIf this happens, I will: ________________\nMy accountability strategy: ________________\nHow I\'ll track progress: ________________',
        type: 'planning'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Designing Systems & Rituals for Follow-Through',
      content: `Goals set the direction, but systems and rituals ensure you arrive at your destination. Learn to create structures that make success inevitable.

The Power of Systems Thinking:

Goals vs. Systems:
• Goals are about the results you want to achieve
• Systems are about the processes that lead to those results
• Goals provide direction; systems provide progress
• You do not rise to the level of your goals; you fall to the level of your systems

Why Systems Beat Goals:
• Systems are process-focused, not outcome-dependent
• They create sustainable habits and behaviors
• They provide daily direction and structure
• They compound over time to create massive results

The Four Pillars of Effective Systems:

1. Environment Design:
Make the right choice the easy choice

Physical Environment:
• Prep healthy snacks in advance
• Set out workout clothes the night before
• Keep books visible and screens hidden
• Create a dedicated meditation space

Digital Environment:
• Unsubscribe from tempting emails
• Use apps that support your goals
• Set phone to "Do Not Disturb" during focused time
• Follow social accounts that inspire healthy choices

Social Environment:
• Spend time with people who support your goals
• Join groups aligned with your wellness vision
• Share your goals with supportive friends
• Find an accountability partner

2. Ritual Creation:
Rituals reduce decision fatigue and create automatic behaviors

Morning Rituals:
• Consistent wake-up time
• Hydration first thing
• Movement or exercise
• Mindfulness or meditation
• Intention setting for the day

Evening Rituals:
• Consistent bedtime routine
• Reflection on the day
• Preparation for tomorrow
• Gratitude practice
• Technology cutoff time

Weekly Rituals:
• Sunday meal prep
• Weekly goal review
• Social connection time
• Nature immersion
• Learning and growth activities

3. Trigger Stacking:
Link new behaviors to existing habits

Formula: "After I [existing habit], I will [new habit]"

Examples:
• After I pour my morning coffee, I will write in my gratitude journal
• After I sit down at my desk, I will take three deep breaths
• After I put on my pajamas, I will prepare my workout clothes
• After I eat lunch, I will take a 5-minute walk

4. Progress Tracking:
What gets measured gets managed

Simple Tracking Methods:
• Habit tracker calendars
• Photo documentation
• Daily check-ins
• Weekly measurements
• Monthly assessments

Advanced Tracking:
• Energy level monitoring
• Mood tracking
• Sleep quality assessment
• Performance metrics
• Relationship quality indicators

Building Your Personal Operating System:

The Daily Scorecard:
Track 3-5 key behaviors daily:
□ 7+ hours sleep
□ 30 minutes movement
□ Healthy breakfast
□ Mindfulness practice
□ Connect with someone I care about

The Weekly Review:
Every Sunday, ask:
• What worked well this week?
• What challenges did I face?
• What do I want to focus on next week?
• How can I improve my systems?
• What support do I need?

The Monthly Audit:
Every month, assess:
• Progress toward goals
• Effectiveness of current systems
• Areas needing adjustment
• New opportunities for growth
• Celebrations and learnings

Creating Powerful Rituals:

Characteristics of Effective Rituals:
• Consistent timing and location
• Clear beginning and end
• Meaningful to you personally
• Reasonable time commitment
• Includes multiple senses
• Connected to your values

Sample Morning Ritual (20 minutes):
1. Drink large glass of water (2 min)
2. Light stretching or movement (5 min)
3. Meditation or breathing (5 min)
4. Gratitude journaling (3 min)
5. Intention setting for day (5 min)

Sample Evening Ritual (15 minutes):
1. Technology shutdown (1 min)
2. Tidy living space (5 min)
3. Reflect on wins of the day (3 min)
4. Prepare for tomorrow (5 min)
5. Express gratitude (1 min)

System Optimization:

The 1% Better Principle:
• Look for small improvements in your systems
• Tiny changes compound over time
• Focus on consistency over perfection
• Adjust based on what you learn

Common System Failures:
• Making them too complex
• Not allowing for flexibility
• Ignoring your natural rhythms
• Not connecting to your why
• Failing to track and adjust

System Maintenance:
• Review and update monthly
• Get feedback from others
• Experiment with improvements
• Simplify when overwhelmed
• Celebrate when systems work

Integration Strategies:
• Start with one system at a time
• Build on existing successful patterns
• Make gradual changes
• Get support from others
• Be patient with the process`,
      learningOutcomes: [
        'Design environment, ritual, and tracking systems for success',
        'Create a personal operating system for daily wellness',
        'Build sustainable structures that make healthy choices automatic'
      ],
      exercise: {
        title: 'Personal Operating System Design',
        prompt: 'Design your comprehensive wellness operating system:\n\n**ENVIRONMENT DESIGN:**\nPhysical changes I\'ll make:\n• Home: ________________\n• Work: ________________\n• Digital: ________________\n\n**DAILY RITUALS:**\nMorning Ritual (15-30 min):\n1. ________________ (__ min)\n2. ________________ (__ min)\n3. ________________ (__ min)\n4. ________________ (__ min)\n\nEvening Ritual (10-20 min):\n1. ________________ (__ min)\n2. ________________ (__ min)\n3. ________________ (__ min)\n\n**TRIGGER STACKING:**\nAfter I ________________, I will ________________\nAfter I ________________, I will ________________\nAfter I ________________, I will ________________\n\n**TRACKING SYSTEM:**\nDaily scorecard (3-5 key behaviors):\n□ ________________\n□ ________________\n□ ________________\n□ ________________\n□ ________________\n\n**WEEKLY REVIEW QUESTIONS:**\n1. ________________?\n2. ________________?\n3. ________________?\n\n**SYSTEM LAUNCH PLAN:**\nI will start with: ________________\nBeginning date: ________________\nFirst week focus: ________________\nAccountability method: ________________',
        type: 'system_design'
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
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                <TrophyIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Module 8: Capstone – Personal Wellness Plan
                </h1>
                <p className="text-lg text-gray-600">
                  Integrate everything into a living, breathing Personal Wellness Plan.
                </p>
              </div>
            </div>
            
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
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
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
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
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
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                        Learning Outcomes
                      </h3>
                      <ul className="space-y-3">
                        {section.learningOutcomes.map((outcome, idx) => (
                          <li key={idx} className="text-gray-700 flex items-start">
                            <span className="text-orange-600 mr-3 mt-1 text-lg">✓</span>
                            <span className="leading-relaxed">{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exercise */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                      <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white text-lg">✍️</span>
                        </div>
                        {section.exercise.title}
                      </h3>
                      <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-100">
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
                            : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:shadow-lg'
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

        {/* Completion Celebration */}
        {completedSections.length === sections.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mt-12"
          >
            <WellnessCard className="bg-gradient-to-r from-green-400 to-blue-500 text-white">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrophyIcon className="w-10 h-10 text-yellow-500" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  🎉 Congratulations! 🎉
                </h2>
                <p className="text-xl mb-6">
                  You've completed the Wellness Coaching Masterclass! You now have the knowledge, tools, and strategies to create lasting wellness transformation in your own life and help others do the same.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={() => navigate('/coaching')}
                    className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                  >
                    Return to Overview
                  </button>
                </div>
              </CardContent>
            </WellnessCard>
          </motion.div>
        )}

        {/* Navigation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex justify-between items-center"
        >
          <button
            onClick={() => navigate('/coaching/module/7')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching')}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center"
          >
            <TrophyIcon className="w-5 h-5 mr-2" />
            Course Complete!
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Module8Page;