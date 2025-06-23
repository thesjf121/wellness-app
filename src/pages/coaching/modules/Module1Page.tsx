import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WellnessCard, CardContent } from '../../../components/ui/WellnessCard';
import { ArrowLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { ModuleContent } from '../../../components/coaching/ModuleContent';

const Module1Page: React.FC = () => {
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
      title: 'Part 1: What is Wellness Coaching?',
      content: `Wellness coaching is a collaborative process that empowers individuals to achieve their health and wellness goals through guidance, support, and accountability. Unlike traditional healthcare models that focus on treating illness, wellness coaching takes a proactive, preventive approach to optimize overall well-being.

Key distinctions:
• Coaches don't diagnose, prescribe, or treat medical conditions
• Focus is on behavior change and lifestyle modification
• Client-driven process where you set the agenda
• Emphasis on sustainable, long-term changes
• Holistic approach considering all aspects of life

The Coaching Relationship:
Wellness coaching is fundamentally different from therapy, consulting, or medical care. While therapists often focus on healing past trauma and doctors treat specific conditions, coaches partner with clients to create their desired future. The coach believes in the client's innate wisdom and capacity for growth.

Core Coaching Competencies:
1. Active Listening - Hearing beyond words to understand meaning
2. Powerful Questions - Asking questions that promote insight
3. Creating Awareness - Helping clients see new perspectives
4. Designing Actions - Supporting clients in creating action plans
5. Managing Progress - Tracking and celebrating achievements`,
      learningOutcomes: [
        'Define wellness coaching and how it differs from other fields',
        'Understand the coach\'s role as facilitator vs. expert',
        'Identify the core competencies of effective coaching'
      ],
      exercise: {
        title: 'Reflection Exercise',
        prompt: 'Write about a time you successfully made a healthy change. What motivated you? What obstacles did you overcome? What support did you have?',
        type: 'reflection'
      }
    },
    {
      id: 'part2',
      title: 'Part 2: The 7 Dimensions of Holistic Health',
      content: `Holistic health recognizes that true wellness encompasses multiple interconnected dimensions. When one area suffers, it affects all others. When one improves, it can lift up the rest.

The 7 Dimensions Explained:

1. Physical Wellness
   • Regular physical activity and exercise
   • Nutritious eating habits
   • Adequate sleep and rest
   • Preventive medical care
   • Avoiding harmful substances

2. Emotional Wellness
   • Understanding and expressing feelings
   • Managing stress effectively
   • Developing resilience
   • Maintaining positive self-esteem
   • Seeking help when needed

3. Mental/Intellectual Wellness
   • Continuous learning and growth
   • Creative expression
   • Problem-solving skills
   • Open-mindedness
   • Intellectual challenges

4. Social Wellness
   • Healthy relationships
   • Effective communication
   • Community involvement
   • Support networks
   • Healthy boundaries

5. Spiritual Wellness
   • Sense of purpose and meaning
   • Personal values and ethics
   • Connection to something greater
   • Inner peace and harmony
   • Gratitude and compassion

6. Environmental Wellness
   • Safe and healthy living spaces
   • Connection with nature
   • Sustainable practices
   • Organized personal environment
   • Community safety

7. Occupational Wellness
   • Career satisfaction
   • Work-life balance
   • Using skills and talents
   • Professional development
   • Positive work relationships

The Interconnected Web:
These dimensions don't exist in isolation. For example:
• Poor sleep (physical) affects mood (emotional) and productivity (occupational)
• Strong relationships (social) improve mental health and provide stress relief (emotional)
• Finding purpose (spiritual) motivates healthy behaviors (physical) and career growth (occupational)`,
      learningOutcomes: [
        'Identify and describe the 7 dimensions of wellness',
        'Understand how dimensions interconnect and influence each other',
        'Assess your current state in each dimension'
      ],
      exercise: {
        title: 'Wellness Wheel Assessment',
        prompt: 'Rate yourself 1-10 in each dimension. Draw a wheel with 7 spokes, marking your score on each spoke. Connect the dots to see your current wellness "shape". Which areas are strongest? Which need attention?',
        type: 'assessment'
      }
    },
    {
      id: 'part3',
      title: 'Part 3: The Coaching Mindset & Approach',
      content: `Effective wellness coaching requires a specific mindset and approach that empowers clients to find their own solutions and create lasting change.

Core Coaching Principles:

1. Client is the Expert
   • They know their life, values, and circumstances best
   • They have the answers within them
   • Our role is to help them access their wisdom

2. Focus on Strengths and Possibilities
   • Build on what's working
   • Explore what's possible, not what's wrong
   • Celebrate progress, no matter how small

3. Ask, Don't Tell
   • Powerful questions unlock insights
   • Advice-giving creates dependency
   • Discovery leads to ownership

4. Create Accountability Without Judgment
   • Support progress without criticism
   • Hold space for struggles
   • Maintain unconditional positive regard

5. Believe in Growth
   • Everyone has the capacity to change
   • Setbacks are learning opportunities
   • Small steps lead to big transformations

Coaching vs. Expert Language:

Instead of Expert Language:
❌ "You should exercise 5 times a week"
❌ "The problem is you're eating too much sugar"
❌ "You need to manage your stress better"
❌ "I think you should try meditation"

Use Coaching Language:
✅ "What kind of movement would feel good to you?"
✅ "What role does food play in your life right now?"
✅ "What helps you feel calm and centered?"
✅ "What strategies have worked for you before?"

The Power of Questions:
Great coaches are masters of asking questions that:
• Open new perspectives
• Encourage self-reflection
• Generate creative solutions
• Build self-awareness
• Inspire action

Examples of Powerful Coaching Questions:
• "What would success look like for you?"
• "What's most important to you about this goal?"
• "What small step could you take this week?"
• "What would you do if you knew you couldn't fail?"
• "How will you know when you've achieved this?"

Creating a Safe Space:
Coaching requires creating an environment where clients feel:
• Heard without judgment
• Safe to be vulnerable
• Empowered to experiment
• Supported through challenges
• Celebrated for efforts`,
      learningOutcomes: [
        'Distinguish between coaching and expert/advice-giving approaches',
        'Practice using empowering language',
        'Develop a growth-oriented mindset'
      ],
      exercise: {
        title: 'Language Practice',
        prompt: 'Rewrite these expert statements as coaching questions:\n1. "You need to exercise more"\n2. "Stop eating junk food"\n3. "You should meditate daily"\n4. "Your problem is lack of sleep"\n5. "You have to reduce stress"',
        type: 'practice'
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
              Module 1: Introduction to Wellness Coaching & Holistic Health
            </h1>
            <p className="text-lg text-gray-600">
              Define wellness coaching, explore holistic health, and understand the role of a coach.
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
            onClick={() => navigate('/coaching')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Overview
          </button>
          
          <button
            onClick={() => navigate('/coaching/module/2')}
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

export default Module1Page;