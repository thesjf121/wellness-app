import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Creating Wellness Through Connection
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Track your steps, log your nutrition with AI assistance, and build accountability 
        through social groups while learning from our comprehensive wellness coaching program.
      </p>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">👟</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Movement Tracking</h3>
          <p className="text-gray-600">
            Sync with your device to track daily steps and build healthy movement habits.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🥗</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Smart Nutrition</h3>
          <p className="text-gray-600">
            Log your meals and get AI-powered insights on calories, macros, and micronutrients.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Social Connection</h3>
          <p className="text-gray-600">
            Join accountability groups and learn from our wellness coaching curriculum.
          </p>
        </div>
      </div>
      
      <div className="space-x-4">
        <button 
          onClick={() => navigate(ROUTES.WELCOME)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Get Started
        </button>
        <button 
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigate(ROUTES.STEP_COUNTER)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Try Step Tracker
        </button>
      </div>
    </div>
  );
};

export default HomePage;