import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Module2Page: React.FC = () => {
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
      title: 'Part 1: The Science & Benefits of Movement',
      content: `Physical activity is medicine for the body and mind. Understanding the science helps motivate consistent practice.

Immediate Benefits (within minutes):
• Increased blood flow and oxygen to brain
• Release of endorphins ("feel-good" chemicals)
• Reduced stress hormones (cortisol)
• Improved mood and mental clarity
• Enhanced creativity and problem-solving
• Better focus and concentration

Long-term Benefits:
• Reduced risk of chronic diseases
  - 50% lower risk of heart disease
  - 40% lower risk of type 2 diabetes
  - 30% lower risk of certain cancers
• Stronger bones and muscles
• Better weight management
• Improved sleep quality
• Enhanced cognitive function and memory
• Increased longevity (up to 7 years added life expectancy)
• Reduced risk of depression and anxiety

The Movement Spectrum:
Movement exists on a continuum - every bit counts!

1. Daily Activities (NEAT - Non-Exercise Activity Thermogenesis)
   • Walking to work or store
   • Taking stairs instead of elevator
   • Housework and gardening
   • Playing with children or pets
   • Standing while working

2. Recreational Movement
   • Dancing for fun
   • Nature walks or hiking
   • Recreational sports
   • Active hobbies
   • Yoga or tai chi

3. Structured Exercise
   • Gym workouts
   • Running or cycling
   • Fitness classes
   • Sports teams
   • Personal training

The Science of Movement:
When you move, your body releases:
• BDNF (Brain-Derived Neurotrophic Factor) - "Miracle Gro" for the brain
• Endorphins - Natural mood elevators
• Dopamine - Motivation and reward chemical
• Serotonin - Happiness and well-being hormone
• Reduced inflammatory markers
• Improved insulin sensitivity`,
      learningOutcomes: [
        'Understand the physiological benefits of regular movement',
        'Identify different types of physical activity',
        'Recognize that all movement counts toward health'
      ],
      exercise: {
        title: 'Movement Energy Tracker',
        prompt: 'For the next 3 days, note your energy level (1-10) before and after any physical activity. Include the type of movement and duration. What patterns do you notice? Does certain movement give you more energy?',
        type: 'tracking'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Creating Your Personalized Movement Plan',
      content: `The best exercise plan is one you'll actually follow. Let's build yours using evidence-based principles.

The FITT-VP Principle:

F - Frequency: How often?
   • Beginners: 3-4 days/week
   • Intermediate: 4-5 days/week
   • Advanced: 5-6 days/week
   • Something daily is ideal (even 5-10 minutes)

I - Intensity: How hard?
   • Light: Can sing while moving
   • Moderate: Can talk but not sing
   • Vigorous: Can only speak a few words
   • Mix intensities for best results

T - Time: How long?
   • Start where you are (even 5-10 minutes)
   • Build gradually (10% increase per week)
   • Aim for 150 min moderate or 75 min vigorous weekly
   • Break into chunks if needed

T - Type: What kind?
   • Choose activities you enjoy!
   • Variety prevents boredom and overuse
   • Include cardio, strength, and flexibility

V - Volume: Total weekly amount
   • Track total minutes per week
   • Quality over quantity
   • Consistency beats perfection

P - Progression: Gradually increase
   • Add 5-10 minutes per week
   • Increase intensity slowly
   • Add new challenges when ready

Building Your Weekly Movement Menu:

Cardio/Aerobic (2-3 days):
• Walking, jogging, swimming
• Dancing, cycling, hiking
• Sports, group fitness classes

Strength (2 days):
• Bodyweight exercises
• Resistance bands
• Weights or machines
• Functional movements

Flexibility/Balance (daily):
• 5-10 minutes stretching
• Yoga or Pilates
• Balance exercises
• Foam rolling

Overcoming Common Barriers:

"I don't have time"
→ Start with 10 minutes
→ Break into 5-minute chunks
→ Exercise while watching TV
→ Walk during phone calls

"I can't afford a gym"
→ Bodyweight exercises at home
→ YouTube fitness videos
→ Walking is free
→ Household items as weights

"Exercise is boring"
→ Try new activities
→ Exercise with friends
→ Listen to music/podcasts
→ Join group classes

"I'm too tired"
→ Movement creates energy
→ Start with gentle activity
→ Exercise improves sleep
→ Notice energy after moving

"I'm not athletic"
→ You don't need to be!
→ Start where you are
→ Focus on how you feel
→ Celebrate small wins`,
      learningOutcomes: [
        'Design a personalized movement plan using FITT-VP',
        'Identify and problem-solve personal barriers',
        'Create realistic, enjoyable movement goals'
      ],
      exercise: {
        title: 'Create Your Weekly Movement Menu',
        prompt: 'Design a realistic movement plan for next week. Include:\n• What type of movement for each day\n• How long you\'ll move\n• What time of day works best\n• One backup plan if something comes up\n\nRemember: Start small and build from there!',
        type: 'planning'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Optimizing Sleep for Recovery & Performance',
      content: `Sleep is when your body repairs, recovers, and consolidates learning. Quality matters as much as quantity.

Understanding Sleep Architecture:

Sleep Stages and Their Functions:

Stage 1-2: Light Sleep (45-55% of night)
• Transition from wakefulness
• Muscle relaxation begins
• Easy to wake up
• Important for rest

Stage 3: Deep Sleep (15-20% of night)
• Physical recovery and repair
• Growth hormone release
• Immune system strengthening
• Memory consolidation
• Most restorative stage

REM Sleep: Dream Sleep (20-25% of night)
• Emotional processing
• Creative problem solving
• Memory integration
• Brain detoxification

Sleep Cycles:
• Each cycle = ~90 minutes
• 4-6 cycles per night optimal
• Waking between cycles feels better
• All stages are important

Sleep Hygiene Essentials:

1. Consistent Schedule
   • Same bedtime/wake time daily (yes, weekends too!)
   • Helps regulate circadian rhythm
   • Makes falling asleep easier

2. Optimal Environment
   • Cool: 65-68°F (18-20°C)
   • Dark: Blackout curtains or eye mask
   • Quiet: Earplugs or white noise
   • Comfortable mattress and pillows

3. Evening Routine (60-90 min before bed)
   • Dim lights to signal bedtime
   • No screens (blue light disrupts melatonin)
   • Relaxing activities (reading, bath, stretching)
   • Avoid large meals and alcohol

4. Daytime Habits for Better Sleep
   • Morning sunlight exposure (sets circadian clock)
   • Regular exercise (but not within 3 hours of bed)
   • Limit caffeine after 2pm
   • Short naps only (20-30 min max)

Common Sleep Disruptors & Solutions:

Racing Mind
→ Keep journal by bed for worries
→ Practice gratitude (3 good things)
→ Progressive muscle relaxation
→ Meditation or breathing exercises

Can't Fall Asleep
→ Get up after 20 minutes
→ Do quiet activity until sleepy
→ No clock watching
→ Avoid phone/screens

Frequent Waking
→ Check room temperature
→ Limit fluids 2 hours before bed
→ Address sleep apnea if snoring
→ Manage stress during day

Early Morning Waking
→ Blackout curtains for light
→ Address anxiety/depression
→ Avoid alcohol (disrupts sleep cycles)
→ Consistent wake time

The Movement-Sleep Connection:
• Regular exercise improves sleep quality
• Morning/afternoon exercise best
• Gentle evening yoga can help
• Better sleep improves exercise performance
• Creates positive cycle`,
      learningOutcomes: [
        'Understand sleep cycles and their importance',
        'Implement evidence-based sleep hygiene practices',
        'Troubleshoot common sleep challenges'
      ],
      exercise: {
        title: 'Sleep Quality Audit',
        prompt: 'Rate your current sleep habits (1-5 scale):\n\n1. Sleep schedule consistency\n2. Bedroom environment (temp, light, noise)\n3. Evening routine\n4. Daytime habits affecting sleep\n5. Overall sleep quality\n\nChoose 1-2 areas scoring lowest. What specific changes will you make this week?',
        type: 'assessment'
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
              Module 2: Physical Wellness – Movement, Exercise & Sleep
            </h1>
            <p className="text-lg text-gray-600">
              Explore movement, sleep, and recovery as the foundation of physical wellness.
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
                  
                  <div className="p-6 space-y-6">
                    {/* Main Content */}
                    <div className="prose prose-lg max-w-none">
                      {section.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {/* Learning Outcomes */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Learning Outcomes
                      </h3>
                      <ul className="space-y-2">
                        {section.learningOutcomes.map((outcome, idx) => (
                          <li key={idx} className="text-gray-700 flex items-start">
                            <span className="text-blue-600 mr-2 mt-0.5">•</span>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Exercise */}
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        ✍️ {section.exercise.title}
                      </h3>
                      <p className="text-gray-700 mb-4 whitespace-pre-line">
                        {section.exercise.prompt}
                      </p>
                      <button
                        onClick={() => markSectionComplete(section.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          completedSections.includes(section.id)
                            ? 'bg-green-600 text-white'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                        disabled={completedSections.includes(section.id)}
                      >
                        {completedSections.includes(section.id) ? 'Completed ✓' : 'Mark as Complete'}
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
            onClick={() => navigate('/coaching/module/1')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/3')}
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

export default Module2Page;