import React from 'react';
import { Layout } from './components/layout/Layout';

function App() {
  return (
    <Layout title="Welcome to WellnessApp">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Creating Wellness Through Connection
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Track your steps, log your nutrition with AI assistance, and build accountability 
          through social groups while learning from our comprehensive wellness coaching program.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">👟</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Movement Tracking</h3>
            <p className="text-gray-600">
              Sync with your device to track daily steps and build healthy movement habits.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-wellness-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🥗</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Nutrition</h3>
            <p className="text-gray-600">
              Log your meals and get AI-powered insights on calories, macros, and micronutrients.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Social Connection</h3>
            <p className="text-gray-600">
              Join accountability groups and learn from our wellness coaching curriculum.
            </p>
          </div>
        </div>
        <div className="mt-12">
          <button className="bg-wellness-600 hover:bg-wellness-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default App;