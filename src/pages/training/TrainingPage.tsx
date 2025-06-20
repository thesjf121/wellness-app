import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMockAuth } from '../../context/MockAuthContext';
import { TrainingModuleNavigation } from '../../components/training/TrainingModuleNavigation';
import { ModuleViewer } from '../../components/training/ModuleViewer';

const TrainingPage: React.FC = () => {
  const { user, isSignedIn } = useMockAuth();
  const { moduleId } = useParams();
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(moduleId || null);

  useEffect(() => {
    console.log('TrainingPage: moduleId from URL:', moduleId);
    if (moduleId) {
      console.log('TrainingPage: Setting selectedModuleId to:', moduleId);
      setSelectedModuleId(moduleId);
    } else {
      setSelectedModuleId(null);
    }
  }, [moduleId]);

  console.log('TrainingPage render: selectedModuleId =', selectedModuleId);

  // Create a mock user if not signed in but accessing module directly
  const effectiveUser = user || {
    id: 'mock_user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'member' as const,
    createdAt: new Date().toISOString()
  };

  if (!isSignedIn && !moduleId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Wellness Training</h1>
          <p className="text-gray-500 mb-6">Please sign in to access your training modules and track your progress.</p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
              Sign In
            </a>
            <a href="/register" className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded-lg">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wellness Coaching Training</h1>
          <p className="text-gray-600 mt-2">Comprehensive wellness coaching curriculum with interactive exercises</p>
        </div>
        
        {selectedModuleId && (
          <button
            onClick={() => setSelectedModuleId(null)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            ← Back to Modules
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Module Navigation */}
        <div className={`${selectedModuleId ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
          <TrainingModuleNavigation
            userId={effectiveUser.id}
            currentModuleId={selectedModuleId || undefined}
            onModuleSelect={setSelectedModuleId}
          />
        </div>

        {/* Module Viewer */}
        {selectedModuleId && (
          <div className="lg:col-span-8">
            <ModuleViewer
              userId={effectiveUser.id}
              moduleId={selectedModuleId}
              onProgressUpdate={() => {
                // Force re-render of navigation to update progress
                setSelectedModuleId(selectedModuleId);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingPage;