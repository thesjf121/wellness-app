import React, { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'getting-started' | 'step-tracking' | 'food-journal' | 'groups' | 'training' | 'account';
}

const HelpCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'step-tracking', label: 'Step Tracking' },
    { value: 'food-journal', label: 'Food Journal' },
    { value: 'groups', label: 'Groups & Community' },
    { value: 'training', label: 'Wellness Training' },
    { value: 'account', label: 'Account & Settings' }
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How do I get started with the app?',
      answer: 'Start by completing your profile setup, then connect step tracking, log your first meal, and begin the wellness training modules. The getting started checklist will guide you through each step.'
    },
    {
      id: '2',
      category: 'step-tracking',
      question: 'Why aren\'t my steps syncing automatically?',
      answer: 'Make sure you\'ve granted permission for the app to access your health data. On iOS, check Settings > Privacy & Security > Health. On Android, ensure Google Fit permissions are enabled. You can also manually enter steps if needed.'
    },
    {
      id: '3',
      category: 'food-journal',
      question: 'How accurate is the AI nutrition analysis?',
      answer: 'Our AI provides estimates based on common food portions and nutritional databases. Results include a confidence score. You can always edit the nutrition information if needed. For best results, be specific about portions and preparation methods.'
    },
    {
      id: '4',
      category: 'groups',
      question: 'When can I create or join a group?',
      answer: 'You need to be active for 7 consecutive days and complete all 8 wellness training modules before you can create or join a group. This ensures you\'re committed to your wellness journey and can contribute meaningfully to the community.'
    },
    {
      id: '5',
      category: 'training',
      question: 'Do I have to complete the training modules in order?',
      answer: 'Yes, the modules are designed to build upon each other. You must complete them sequentially, starting with Module 1. Each module takes about 45-60 minutes to complete and includes interactive exercises.'
    },
    {
      id: '6',
      category: 'account',
      question: 'How do I change my wellness goals?',
      answer: 'Go to your Profile page and click on "Edit Goals" to update your daily step target, nutrition goals, and primary wellness objectives. Changes will be reflected in your dashboard immediately.'
    },
    {
      id: '7',
      category: 'step-tracking',
      question: 'Can I set a custom step goal?',
      answer: 'Yes! You can set any daily step goal between 1,000 and 50,000 steps. The default is 8,000 steps, but you can adjust this in your profile settings to match your fitness level and goals.'
    },
    {
      id: '8',
      category: 'food-journal',
      question: 'What should I do if the AI doesn\'t recognize my food?',
      answer: 'Try describing the food differently or add more details about preparation. If it still doesn\'t work, you can manually enter the nutrition information. Common foods and simple descriptions usually work best.'
    },
    {
      id: '9',
      category: 'groups',
      question: 'How many people can be in a group?',
      answer: 'Each group has a maximum of 10 members to maintain intimacy and meaningful connections. This size allows everyone to participate actively and build genuine relationships.'
    },
    {
      id: '10',
      category: 'training',
      question: 'What happens if I miss a day of training?',
      answer: 'No problem! You can resume training anytime. The modules save your progress automatically, so you can pick up where you left off. However, consistent engagement will help you build better habits.'
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started': return '🚀';
      case 'step-tracking': return '👟';
      case 'food-journal': return '🥗';
      case 'groups': return '👥';
      case 'training': return '🎓';
      case 'account': return '⚙️';
      default: return '❓';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-xl text-gray-600">
          Find answers to common questions about using the wellness app
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl mb-2">📧</div>
          <h3 className="font-semibold text-gray-900 mb-1">Contact Support</h3>
          <p className="text-sm text-gray-600 mb-3">Get personalized help from our team</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
            Send Message
          </button>
        </div>

        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold text-gray-900 mb-1">Take App Tour</h3>
          <p className="text-sm text-gray-600 mb-3">Learn how to use key features</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
            Start Tour
          </button>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-3xl mb-2">📚</div>
          <h3 className="font-semibold text-gray-900 mb-1">User Guide</h3>
          <p className="text-sm text-gray-600 mb-3">Comprehensive documentation</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">
            View Guide
          </button>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter</p>
          </div>
        ) : (
          filteredFAQs.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() => toggleFAQ(item.id)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getCategoryIcon(item.category)}</span>
                    <span className="font-semibold text-gray-900">{item.question}</span>
                  </div>
                  <span className={`text-gray-400 transform transition-transform ${
                    expandedFAQ === item.id ? 'rotate-180' : ''
                  }`}>
                    ↓
                  </span>
                </div>
              </button>
              
              {expandedFAQ === item.id && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed pt-4">{item.answer}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Additional Help */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Still need help?</h3>
        <p className="text-gray-600 mb-4">
          Our support team is here to help you succeed on your wellness journey
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium">
            Contact Support
          </button>
          <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 font-medium">
            Join Community Forum
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;