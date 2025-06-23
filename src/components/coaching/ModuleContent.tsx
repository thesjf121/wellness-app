import React from 'react';

interface ModuleContentProps {
  content: string;
}

export const ModuleContent: React.FC<ModuleContentProps> = ({ content }) => {
  const renderContent = (text: string) => {
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, idx) => {
      // Handle special formatting for expert vs coaching language
      if (paragraph.includes('Instead of Expert Language:')) {
        const lines = paragraph.split('\n');
        return (
          <div key={idx} className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">Instead of Expert Language:</h4>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded-r-lg">
              <div className="space-y-2">
                {lines.slice(1).filter(line => line.includes('❌')).map((line, i) => (
                  <p key={i} className="text-gray-700">{line}</p>
                ))}
              </div>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-4 mt-6">Use Coaching Language:</h4>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <div className="space-y-2">
                {lines.filter(line => line.includes('✅')).map((line, i) => (
                  <p key={i} className="text-gray-700">{line}</p>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      // Handle headings
      const headingPatterns = [
        'Key distinctions:', 'The Coaching Relationship:', 'Core Coaching Competencies:',
        'The 7 Dimensions Explained:', 'The Interconnected Web:', 'Core Coaching Principles:',
        'Coaching vs. Expert Language:', 'The Power of Questions:', 'Creating a Safe Space:',
        'Immediate Benefits', 'Long-term Benefits:', 'The Movement Spectrum:',
        'The Science of Movement:', 'The FITT-VP Principle:', 'Building Your Weekly Movement Menu:',
        'Overcoming Common Barriers:', 'Understanding Sleep Architecture:', 'Sleep Hygiene Essentials:',
        'Common Sleep Disruptors & Solutions:', 'The Movement-Sleep Connection:',
        'Macronutrients - Your Body\'s Fuel:', 'Micronutrients - The Spark Plugs:',
        'The Hunger-Fullness Scale', 'Mindful Eating Practices:', 'Understanding Why We Eat:',
        'The Plate Method', 'Meal Prep Made Easy:', 'Healthy Swaps That Satisfy:',
        'The 80/20 Approach:', 'Defining Mental Wellness:', 'The Mind-Body Connection:',
        'Emotional Intelligence Components:', 'Common Cognitive Distortions:', 'The ABC Model',
        'Growth vs. Fixed Mindset:', 'The Resilience Framework:', 'Daily Practices',
        'Building Your Resilience Toolkit:', 'The Power of Self-Compassion:'
      ];
      
      const isHeading = headingPatterns.some(pattern => paragraph.startsWith(pattern));
      
      if (isHeading) {
        const [heading, ...rest] = paragraph.split('\n');
        return (
          <div key={idx} className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-purple-800">
              {heading}
            </h3>
            {renderParagraphContent(rest.join('\n'))}
          </div>
        );
      }
      
      // Regular content
      return (
        <div key={idx} className="mb-6">
          {renderParagraphContent(paragraph)}
        </div>
      );
    });
  };
  
  const renderParagraphContent = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, idx) => {
      // Skip empty lines
      if (!line.trim()) return null;
      
      // Handle numbered lists (e.g., "1. Item")
      if (line.trim().match(/^\d+\./)) {
        const [number, ...content] = line.split('.');
        return (
          <div key={idx} className="flex items-start mb-3 ml-4">
            <span className="text-purple-600 font-bold mr-3 mt-0.5">
              {number}.
            </span>
            <span className="text-gray-700 leading-relaxed flex-1">
              {content.join('.').trim()}
            </span>
          </div>
        );
      }
      
      // Handle bullet points
      if (line.trim().startsWith('•')) {
        return (
          <div key={idx} className="flex items-start mb-2 ml-4">
            <span className="text-purple-500 mr-3 mt-1">•</span>
            <span className="text-gray-700 leading-relaxed flex-1">
              {line.substring(1).trim()}
            </span>
          </div>
        );
      }
      
      // Handle sub-items with dash
      if (line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start mb-2 ml-12">
            <span className="text-gray-400 mr-3 mt-1">–</span>
            <span className="text-gray-600 leading-relaxed flex-1 text-sm">
              {line.substring(1).trim()}
            </span>
          </div>
        );
      }
      
      // Handle arrows (→)
      if (line.includes('→')) {
        const [problem, solution] = line.split('→');
        return (
          <div key={idx} className="flex items-center mb-2 ml-4 bg-blue-50 p-3 rounded-lg">
            <span className="text-gray-700">{problem.trim()}</span>
            <span className="mx-3 text-blue-600">→</span>
            <span className="text-blue-700 font-medium">{solution.trim()}</span>
          </div>
        );
      }
      
      // Handle lines with colons as sub-headings
      if (line.includes(':') && !line.startsWith(' ') && line.indexOf(':') < 50) {
        const [heading, ...content] = line.split(':');
        if (content.join(':').trim()) {
          return (
            <p key={idx} className="mb-3">
              <span className="font-semibold text-gray-800">{heading}:</span>
              <span className="text-gray-700">{content.join(':')}</span>
            </p>
          );
        } else {
          return (
            <h4 key={idx} className="font-semibold text-gray-800 mt-4 mb-2">
              {heading}:
            </h4>
          );
        }
      }
      
      // Regular text
      return (
        <p key={idx} className="text-gray-700 leading-relaxed mb-3">
          {line}
        </p>
      );
    });
  };
  
  return (
    <div className="prose prose-lg max-w-none">
      {renderContent(content)}
    </div>
  );
};

export default ModuleContent;