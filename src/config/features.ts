// Feature flags configuration
export const UI_FEATURES = {
  useCardBasedUI: process.env.REACT_APP_USE_CARD_UI === 'true',
  enableCardAnimations: process.env.REACT_APP_CARD_ANIMATIONS !== 'false',
  enableInteractiveCards: process.env.REACT_APP_INTERACTIVE_CARDS !== 'false'
};

// Helper function to check if card-based UI is enabled
export const isCardUIEnabled = (): boolean => {
  return UI_FEATURES.useCardBasedUI;
};

// Helper function to check feature flags
export const getFeatureFlag = (flag: keyof typeof UI_FEATURES): boolean => {
  return UI_FEATURES[flag];
};