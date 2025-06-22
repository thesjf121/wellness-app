import React from 'react';
import { ClerkAuthForm } from '../../components/auth/ClerkAuthForm';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';

interface AuthPageProps {
  mode: 'login' | 'register';
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  return (
    <ParallaxContainer
      backgroundGradient={parallaxPresets.homepage.backgroundGradient}
      className="min-h-screen"
    >
      <ParallaxLayer speed={0.2} className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <ClerkAuthForm mode={mode} />
        </div>
      </ParallaxLayer>
    </ParallaxContainer>
  );
};

export default AuthPage;