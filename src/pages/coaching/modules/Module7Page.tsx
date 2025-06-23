import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module7Page: React.FC = () => {
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
      title: 'Part 1: Defining Self-Coaching & Its Importance',
      content: `Self-coaching is the practice of being your own guide, mentor, and accountability partner. It's the bridge between learning and lasting transformation.

What Is Self-Coaching?

Self-coaching is the ability to:
• Step back and observe your patterns objectively
• Ask yourself powerful questions that generate insights
• Design strategies and action plans for your goals
• Hold yourself accountable with compassion
• Celebrate progress and learn from setbacks
• Continuously refine your approach based on results

Why Self-Coaching Matters:

Independence and Empowerment:
• Reduces dependence on external validation
• Builds confidence in your own judgment
• Develops internal wisdom and intuition
• Creates sustainable change from within

Available 24/7:
• Your inner coach is always accessible
• No scheduling conflicts or appointments needed
• Immediate support during challenging moments
• Continuous guidance throughout your journey

Cost-Effective Growth:
• No ongoing financial investment required
• Unlimited sessions and support
• Personalized to your exact needs and schedule
• Builds skills that benefit all areas of life

Faster Problem-Solving:
• You know yourself better than anyone else
• Immediate access to your full context and history
• No need to explain background or catch anyone up
• Solutions emerge from your own wisdom

The Self-Coaching Mindset:

Curiosity Over Judgment:
Instead of: "Why am I so lazy?"
Try: "What's making it hard for me to take action right now?"

Growth Orientation:
Instead of: "I failed again"
Try: "What can I learn from this experience?"

Self-Compassion:
Instead of: "I should be further along"
Try: "I'm making progress at my own pace"

Solution Focus:
Instead of: "This is impossible"
Try: "What small step could I take today?"

Core Self-Coaching Principles:

1. Non-Judgmental Awareness
   • Observe without criticism
   • Notice patterns without blame
   • Accept current reality as starting point

2. Powerful Questions
   • Questions that open possibilities
   • Focus on solutions and learning
   • Generate insights and motivation

3. Experimenting Mindset
   • Try new approaches
   • View setbacks as data
   • Adjust based on results

4. Self-Compassion
   • Treat yourself like a good friend
   • Acknowledge effort, not just results
   • Practice kindness during struggles

5. Accountability with Flexibility
   • Set realistic expectations
   • Track progress consistently
   • Adjust plans when needed

The Inner Coach vs. Inner Critic:

Inner Critic Says:
• "You always mess up"
• "You're not good enough"
• "You should be perfect"
• "Everyone else is better"
• "Why even try?"

Inner Coach Says:
• "What can you learn from this?"
• "You're growing and improving"
• "Progress, not perfection"
• "Everyone has unique strengths"
• "What's one small step you can take?"

Developing Your Inner Coach Voice:
• Practice compassionate self-talk
• Use your name when giving yourself advice
• Imagine what you'd tell a good friend
• Focus on growth and learning
• Celebrate small wins consistently`,
      learningOutcomes: [
        'Define self-coaching and understand its unique benefits',
        'Distinguish between inner coach and inner critic voices',
        'Adopt core principles of effective self-coaching'
      ],
      exercise: {
        title: 'Inner Voice Audit',
        prompt: 'For the next 2 days, pay attention to your inner dialogue:\n\n**INNER CRITIC TRACKER:**\nDay 1 - Most common self-critical thoughts:\n1. ________________\n2. ________________\n3. ________________\n\nDay 2 - Most common self-critical thoughts:\n1. ________________\n2. ________________\n3. ________________\n\n**INNER COACH REFRAMES:**\nFor each critical thought, write a compassionate reframe:\n\nCritic: "You always procrastinate"\nCoach: ________________\n\nCritic: "You\'re not disciplined enough"\nCoach: ________________\n\nCritic: "You should be further along"\nCoach: ________________\n\n**PRACTICE:**\nChoose one inner coach phrase to use daily this week: ________________',
        type: 'awareness'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Self-Coaching Tools for Clarity & Motivation',
      content: `Effective self-coaching requires practical tools and frameworks that help you gain clarity, maintain motivation, and navigate challenges.

The GROW Model for Self-Coaching:

G - Goal: What do you want to achieve?
• Be specific and clear about your desired outcome
• Make it meaningful and aligned with your values
• Set both short-term and long-term goals

R - Reality: What is your current situation?
• Assess where you are honestly
• Identify resources and constraints
• Acknowledge both challenges and opportunities

O - Options: What are your possible paths forward?
• Brainstorm multiple approaches
• Consider creative and unconventional solutions
• Don't judge options initially, just generate them

W - Will/Way Forward: What will you do?
• Choose your next steps
• Set specific, time-bound actions
• Plan for obstacles and accountability

Powerful Self-Coaching Questions:

For Clarity:
• What do I really want in this situation?
• What's most important to me right now?
• If I could wave a magic wand, what would change?
• What would success look like?
• What am I not seeing clearly?

For Motivation:
• Why does this matter to me?
• How will I feel when I achieve this?
• What are the costs of staying where I am?
• What's one thing I can do today to move forward?
• How can I make this more enjoyable?

For Problem-Solving:
• What would I tell a friend in this situation?
• What resources do I have available?
• What has worked for me in similar situations?
• What would happen if I did nothing?
• What's the smallest step I could take?

For Learning:
• What went well and why?
• What would I do differently next time?
• What patterns am I noticing?
• What is this experience teaching me?
• How have I grown from this challenge?

The Weekly Self-Coaching Session:

Set aside 20-30 minutes weekly for structured self-reflection:

1. Review the Past Week (5 minutes):
   • What did I accomplish?
   • What challenges did I face?
   • What patterns do I notice?

2. Assess Current State (5 minutes):
   • How am I feeling physically, mentally, emotionally?
   • What's working well in my life?
   • What needs attention?

3. Clarify Priorities (10 minutes):
   • What's most important for the coming week?
   • What goals do I want to focus on?
   • What would make next week successful?

4. Plan Actions (10 minutes):
   • What specific steps will I take?
   • When will I do them?
   • What obstacles might I face and how will I handle them?

Daily Check-In Questions:

Morning:
• What's my intention for today?
• How do I want to feel at the end of the day?
• What's one thing I'm committed to doing?

Midday:
• How am I doing with my morning intention?
• What adjustments do I need to make?
• What do I need right now to feel my best?

Evening:
• What went well today?
• What did I learn?
• How can I celebrate my efforts?
• What will I do differently tomorrow?

Motivation Maintenance Tools:

Vision Board/Dream List:
• Visual representation of your goals
• Review regularly to maintain motivation
• Update as your vision evolves

Success Journal:
• Record daily wins, no matter how small
• Note progress toward goals
• Include lessons learned and insights

Energy Audit:
• Track what gives you energy vs. drains it
• Schedule more energizing activities
• Minimize or modify draining tasks

Values Clarification:
• Identify your core values
• Use them as decision-making criteria
• Align goals and actions with values

Progress Tracking:
• Visual progress charts
• Photo documentation
• Measurement tracking
• Habit streaks`,
      learningOutcomes: [
        'Apply the GROW model for structured self-coaching sessions',
        'Use powerful questions to generate insights and solutions',
        'Implement daily and weekly self-coaching practices'
      ],
      exercise: {
        title: 'Personal GROW Session',
        prompt: 'Complete a GROW session for one current challenge or goal:\n\n**GOAL - What do I want to achieve?**\n________________\n________________\n\n**REALITY - What is my current situation?**\nCurrent state: ________________\nResources I have: ________________\nChallenges I face: ________________\n\n**OPTIONS - What are my possible paths?**\nOption 1: ________________\nOption 2: ________________\nOption 3: ________________\nCreative/unusual option: ________________\n\n**WILL/WAY FORWARD - What will I do?**\nNext 3 actions I will take:\n1. ________________ (by when: ______)\n2. ________________ (by when: ______)\n3. ________________ (by when: ______)\n\nPotential obstacles: ________________\nHow I\'ll handle them: ________________\n\nAccountability: How will I track progress? ________________',
        type: 'coaching'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Building Momentum Using Tracking & Self-Compassion',
      content: `Sustainable motivation comes from building momentum through consistent progress tracking and treating yourself with the same kindness you'd show a good friend.

The Science of Momentum:

Newton's First Law Applied to Habits:
• Objects in motion stay in motion
• Objects at rest stay at rest
• Small consistent actions build momentum
• Momentum makes future action easier

The Progress Principle:
Research shows that tracking small wins:
• Increases motivation and engagement
• Improves performance over time
• Creates positive emotions and confidence
• Makes people more resilient to setbacks

Dopamine and Progress:
• Brain releases dopamine when we see progress
• This creates desire to continue the behavior
• Visual progress tracking amplifies this effect
• Celebration enhances the dopamine response

Effective Progress Tracking:

Input vs. Output Tracking:

Input Tracking (What You Control):
• Days exercised this week
• Healthy meals prepared
• Minutes meditated
• Books read
• Kind acts performed

Output Tracking (Results):
• Weight lost
• Money saved
• Skill level achieved
• Relationships improved
• Goals completed

Focus primarily on inputs for better motivation and less frustration.

Tracking Methods:

Visual Tracking:
• Habit tracker calendars
• Progress bars and charts
• Before/after photos
• Physical tokens or stickers
• Wall calendars with X's

Digital Tracking:
• Apps and software
• Spreadsheets
• Photos and videos
• Audio logs
• Online communities

Analog Tracking:
• Paper journals
• Wall charts
• Physical counters
• Notebook lists
• Index cards

The Two-Day Rule:
Never miss twice in a row. This prevents temporary lapses from becoming permanent backslides.

Self-Compassion as a Motivational Tool:

The Three Components of Self-Compassion:

1. Self-Kindness vs. Self-Judgment:
   • Treat yourself with understanding
   • Use gentle, encouraging language
   • Acknowledge that setbacks are normal
   • Focus on learning, not punishment

2. Common Humanity vs. Isolation:
   • Remember that everyone struggles
   • Your challenges don't make you uniquely flawed
   • Connect with others who face similar issues
   • Normalize the difficulty of change

3. Mindfulness vs. Over-Identification:
   • Observe thoughts and feelings without being consumed
   • See setbacks as temporary, not permanent
   • Hold your experience with balanced awareness
   • Don't ignore problems or dramatize them

Self-Compassion Practices:

The Self-Compassion Break:
When facing difficulty:
1. "This is a moment of struggle" (mindfulness)
2. "Struggle is part of life" (common humanity)
3. "May I be kind to myself" (self-kindness)

The Best Friend Test:
Ask yourself: "What would I say to a dear friend facing this same challenge?" Then say that to yourself.

Reframe Setbacks:
Instead of: "I'm a failure"
Try: "I'm human and still learning"

Instead of: "I ruined everything"
Try: "I had a setback and tomorrow is a fresh start"

Building Momentum Strategies:

Start Where You Are:
• Accept your current reality without judgment
• Use your current energy level as starting point
• Work with your natural rhythms
• Build on existing positive patterns

Celebrate Small Wins:
• Acknowledge effort, not just results
• Create mini-celebrations for daily actions
• Share victories with supportive people
• Keep a "wins" journal

Create Positive Feedback Loops:
• Track leading indicators
• Make progress visible
• Reward consistency
• Share your journey with others

Stack Your Successes:
• Link new habits to established ones
• Use successful areas to build confidence
• Apply proven strategies to new challenges
• Create systems that reinforce each other

The Compound Effect of Self-Compassion:
Research shows that self-compassionate people:
• Are more motivated to improve after failures
• Show greater emotional resilience
• Engage in healthier behaviors
• Have lower anxiety and depression
• Maintain motivation longer`,
      learningOutcomes: [
        'Implement effective progress tracking systems',
        'Practice self-compassion to maintain long-term motivation',
        'Build momentum through small wins and consistent action'
      ],
      exercise: {
        title: 'Momentum Building Plan',
        prompt: 'Create your personal momentum building system:\n\n**TRACKING SYSTEM:**\nOne goal I want to build momentum on: ________________\n\nInput I\'ll track (what I control): ________________\nOutput I\'ll track (results): ________________\n\nTracking method I\'ll use: ________________\nWhere I\'ll track it: ________________\nWhen I\'ll update it: ________________\n\n**SELF-COMPASSION PLAN:**\nMy common self-critical thoughts: ________________\nCompassionate reframe: ________________\n\nWhat I\'d tell a friend in my situation: ________________\n\n**CELEBRATION RITUALS:**\nDaily win celebration: ________________\nWeekly progress celebration: ________________\nMonthly milestone celebration: ________________\n\n**MOMENTUM MANTRA:**\nWrite a kind, encouraging phrase to use when motivation is low:\n________________\n\n**TWO-DAY RULE PLAN:**\nIf I miss one day, I will: ________________\nMy comeback plan: ________________',
        type: 'planning'
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
              Module 7: Self-Coaching & Long-Term Motivation
            </h1>
            <p className="text-lg text-gray-600">
              Learn to coach yourself for sustained motivation, resilience, and accountability.
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
            onClick={() => navigate('/coaching/module/6')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/8')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center"
          >
            Final Module
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Module7Page;