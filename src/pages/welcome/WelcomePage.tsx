import React from 'react';
import WelcomeSection from '../../components/welcome/WelcomeSection';
import { ParallaxContainer, ParallaxLayer, parallaxPresets } from '../../components/ui/ParallaxContainer';

const WelcomePage: React.FC = () => {
  return (
    <ParallaxContainer
      backgroundGradient={parallaxPresets.homepage.backgroundGradient}
      className="min-h-screen"
    >
      <ParallaxLayer speed={0.3} className="min-h-screen">
        <WelcomeSection />
      </ParallaxLayer>
    </ParallaxContainer>
  );
};

export default WelcomePage;