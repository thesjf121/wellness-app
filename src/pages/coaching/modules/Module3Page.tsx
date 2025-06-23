import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module3Page: React.FC = () => {
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
      title: 'Part 1: Nutrition Fundamentals Without the Confusion',
      content: `Let's simplify nutrition and focus on what really matters for health and energy.

Macronutrients - Your Body's Fuel:

Carbohydrates (45-65% of calories): Primary Energy Source
• Complex Carbs (Preferred):
  - Whole grains: Brown rice, quinoa, oats, whole wheat
  - Vegetables: All types, especially colorful ones
  - Legumes: Beans, lentils, chickpeas
  - Provide steady, sustained energy
  
• Simple Carbs (Use Wisely):
  - Fruits: Natural sugars with fiber and nutrients
  - Dairy: Lactose provides quick energy
  - Limit refined: White bread, pastries, sugary drinks
  - Can cause energy spikes and crashes

Proteins (10-35% of calories): Building Blocks
• Complete Proteins (All essential amino acids):
  - Animal: Chicken, fish, eggs, dairy
  - Plant: Soy, quinoa, hemp seeds
  
• Incomplete Proteins (Combine for completeness):
  - Grains + Legumes: Rice and beans
  - Nuts + Grains: Peanut butter on whole wheat
  - Seeds + Legumes: Hummus with sesame seeds
  
• Aim for palm-sized portion at each meal
• Helps with satiety and muscle maintenance

Fats (20-35% of calories): Essential Functions
• Healthy Fats to Emphasize:
  - Monounsaturated: Olive oil, avocados, nuts
  - Polyunsaturated: Fatty fish, walnuts, flax seeds
  - Omega-3s: Salmon, chia seeds, walnuts
  
• Functions:
  - Hormone production
  - Brain health
  - Nutrient absorption (vitamins A, D, E, K)
  - Cell membrane health
  - Inflammation reduction

Micronutrients - The Spark Plugs:

Vitamins:
• Water-soluble (B vitamins, C): Need daily replenishment
• Fat-soluble (A, D, E, K): Stored in body, need fat for absorption

Minerals:
• Major minerals: Calcium, magnesium, potassium
• Trace minerals: Iron, zinc, selenium

The Rainbow Principle:
• Red: Lycopene for heart health
• Orange: Beta-carotene for vision
• Yellow: Vitamin C for immunity
• Green: Folate and iron
• Blue/Purple: Anthocyanins for brain health
• White: Allicin for immune support

Eat a variety of colors daily for optimal nutrition!

Hydration - The Forgotten Nutrient:
• 60% of body is water
• Functions: Temperature regulation, nutrient transport, waste removal
• Needs: 8-10 glasses daily, more with exercise
• Signs of good hydration: Pale yellow urine, consistent energy
• Include: Water, herbal tea, water-rich foods`,
      learningOutcomes: [
        'Understand the role of macronutrients in health',
        'Identify quality sources of carbs, proteins, and fats',
        'Recognize the importance of micronutrient variety'
      ],
      exercise: {
        title: 'Macronutrient Awareness',
        prompt: 'For one day, simply notice the balance of carbs, proteins, and fats in your meals. No judgment or changes - just observation! Write down what you notice about:\n• Which macronutrient dominates your meals?\n• How do different combinations make you feel?\n• Any patterns in your choices?',
        type: 'awareness'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: Mindful Eating & Intuitive Nutrition',
      content: `Mindful eating transforms your relationship with food from rules to awareness.

The Hunger-Fullness Scale (1-10):

1-2: Ravenous
• Shaky, irritable, desperate
• May lead to overeating
• Avoid getting this hungry

3-4: Hungry
• Stomach growling
• Ready to eat
• Ideal time to start eating

5-6: Neutral/Satisfied
• No longer hungry
• Comfortable, energized
• Ideal stopping point

7-8: Full
• Slightly uncomfortable
• Past satisfaction
• Common stopping point

9-10: Stuffed
• Very uncomfortable
• Sluggish, bloated
• Avoid regularly

Goal: Eat at 3-4, stop at 6-7

Mindful Eating Practices:

1. The Pause Before Eating
   • Check hunger level
   • Set an intention
   • Express gratitude
   • Take 3 deep breaths

2. Engage Your Senses
   • Look: Colors, presentation
   • Smell: Aromas, freshness
   • Touch: Textures, temperature
   • Taste: Flavors, complexity
   • Listen: Crunch, sizzle

3. Slow Down Techniques
   • Put utensils down between bites
   • Chew thoroughly (20-30 times)
   • Sip water between bites
   • Conversation during meals
   • No screens while eating

4. The Halfway Check-In
   • Pause mid-meal
   • Assess hunger/fullness
   • Notice satisfaction
   • Decide to continue or stop

Understanding Why We Eat:

Physical Hunger:
• Gradual onset
• Any food sounds good
• Physical sensations (stomach growling)
• Stops when full
• No guilt afterward

Emotional Hunger:
• Sudden onset
• Specific cravings
• No physical signs
• Doesn't stop when full
• Often followed by guilt

Other Reasons We Eat:
• Social: Connection, celebration
• Habitual: Time of day, location
• Sensory: Looks/smells good
• Practical: It's there, don't waste

All reasons are valid - awareness helps you choose consciously.

Breaking the Diet Mentality:

Instead of Rules:
❌ "I can't eat carbs"
✅ "How do different foods make me feel?"

❌ "I was bad today"
✅ "I made choices, tomorrow is new"

❌ "I ruined everything"
✅ "One meal doesn't define me"

Building Food Peace:
• No foods are forbidden
• All foods fit in moderation
• Focus on addition, not restriction
• Honor cravings mindfully
• Trust your body's wisdom`,
      learningOutcomes: [
        'Use the hunger-fullness scale to guide eating',
        'Practice mindful eating techniques',
        'Distinguish between physical and emotional hunger'
      ],
      exercise: {
        title: 'Mindful Meal Practice',
        prompt: 'Choose one meal this week to eat mindfully:\n\n1. Rate hunger before eating (1-10)\n2. Remove all distractions\n3. Take 3 breaths before starting\n4. Eat slowly, engaging all senses\n5. Pause halfway to check fullness\n6. Stop when satisfied\n7. Rate fullness after (1-10)\n\nWhat did you notice? How was this different from usual?',
        type: 'practice'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: Practical Strategies for Sustainable Healthy Eating',
      content: `Make healthy eating simple, enjoyable, and sustainable with these strategies.

The Plate Method (No Measuring Required!):

Visual Guide for Balanced Meals:
• 1/2 Plate: Non-starchy Vegetables
  - Leafy greens, broccoli, peppers
  - Carrots, tomatoes, zucchini
  - The more colors, the better
  
• 1/4 Plate: Lean Protein
  - Chicken, fish, tofu, eggs
  - Beans, lentils, tempeh
  - Greek yogurt, cottage cheese
  
• 1/4 Plate: Whole Grains/Starchy Vegetables
  - Brown rice, quinoa, oats
  - Sweet potatoes, corn, peas
  - Whole grain bread or pasta
  
• Add: Healthy Fats
  - Olive oil drizzle
  - Avocado slices
  - Nuts or seeds
  
• Include: Fruit and/or Dairy
  - Fresh fruit for dessert
  - Yogurt or milk
  - Small portion sizes

Meal Prep Made Easy:

Sunday Prep Session (1-2 hours):
1. Batch Cook Basics:
   • 2-3 whole grains
   • 2-3 protein sources
   • Roasted vegetables
   • Hard-boiled eggs

2. Prep Ingredients:
   • Wash and chop vegetables
   • Pre-portion snacks
   • Make 1-2 sauces/dressings
   • Prepare grab-and-go options

3. Mix-and-Match Meals:
   • Grain bowls
   • Big salads
   • Stir-fries
   • Wraps and sandwiches
   • Same ingredients, different flavors

Smart Shopping Strategies:
• Shop perimeter first (fresh foods)
• Make a list and stick to it
• Don't shop hungry
• Read labels: <5 ingredients ideal
• Buy seasonal produce
• Stock healthy pantry staples

Healthy Swaps That Satisfy:

Gradual Changes Work Best:
• White rice → 50/50 white and brown → Brown rice
• Regular pasta → 50/50 regular and whole grain → Whole grain
• Chips → Baked chips → Air-popped popcorn
• Soda → Diet soda → Sparkling water + fruit
• Ice cream → Frozen yogurt → Greek yogurt parfait

Flavor Without Calories:
• Herbs and spices
• Citrus juice and zest
• Vinegars
• Hot sauce
• Garlic and ginger
• Fresh herbs

The 80/20 Approach:

Balance, Not Perfection:
• 80% nourishing choices
• 20% fun foods
• No guilt or "cheat days"
• All foods fit in moderation
• Focus on overall patterns

Building Sustainable Habits:
• Start with one change
• Add, don't subtract
• Make it convenient
• Plan for challenges
• Celebrate small wins

Eating Out Successfully:
• Preview menu online
• Eat a small snack before
• Order first to avoid influence
• Ask for modifications
• Box half for later
• Enjoy the experience`,
      learningOutcomes: [
        'Apply the plate method for balanced meals',
        'Implement simple meal prep strategies',
        'Make sustainable healthy swaps without feeling deprived'
      ],
      exercise: {
        title: 'Grocery Makeover Challenge',
        prompt: 'Identify 3 foods you regularly buy. Find healthier swaps that you would actually enjoy:\n\n1. Current food → Healthier swap\n2. Current food → Healthier swap\n3. Current food → Healthier swap\n\nTry these swaps this week. Rate each:\n• Taste (1-10)\n• Satisfaction (1-10)\n• Likelihood to continue (1-10)\n\nRemember: The best swap is one you\'ll stick with!',
        type: 'action'
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
              Module 3: Nutrition & Healthy Eating Habits
            </h1>
            <p className="text-lg text-gray-600">
              Break down practical nutrition strategies for sustained energy and mental clarity.
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
            onClick={() => navigate('/coaching/module/2')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Previous Module
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/4')}
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

export default Module3Page;