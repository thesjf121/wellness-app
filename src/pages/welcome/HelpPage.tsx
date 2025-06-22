import React from 'react';
import HelpCenter from '../../components/welcome/HelpCenter';
import { TutorialMenu, TutorialProgress } from '../../components/navigation/TutorialProvider';
import { BottomNavigation } from '../../components/ui/BottomNavigation';

const HelpPage: React.FC = () => {

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HelpCenter />
            </div>
            
            <div className="space-y-6">
              <TutorialProgress />
              <TutorialMenu />
            </div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </>
  );
};

export default HelpPage;