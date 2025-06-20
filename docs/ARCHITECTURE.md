# WellnessApp Technical Architecture

## Overview
WellnessApp is a hybrid mobile wellness application built with Capacitor, React, and TypeScript. The app focuses on creating wellness through movement, nutrition, and social connection.

## Technology Stack

### Frontend
- **Framework**: React 19.1.0 with TypeScript
- **UI Library**: Tailwind CSS 3.4.17
- **State Management**: Zustand 4.4.7
- **Routing**: React Router DOM 6.20.1
- **Mobile Framework**: Capacitor 7.3.0
- **Icons**: Heroicons, Lucide React

### Authentication
- **Provider**: Clerk
- **Implementation**: @clerk/clerk-react
- **Features**: Social login, email/password, role-based access

### Backend Services
- **Hosting**: Render
- **Database**: PostgreSQL (via Render)
- **AI Integration**: Google Gemini API
- **Health Data**: HealthKit (iOS), Google Fit (Android)

### Development Tools
- **Build Tool**: Create React App (react-scripts)
- **Type Checking**: TypeScript 4.9.5
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions → Render

## Architecture Decisions

### 1. Hybrid Mobile Approach
**Decision**: Use Capacitor instead of React Native or Flutter
**Rationale**:
- Single codebase for web and mobile
- Easier maintenance with web technologies
- Native API access when needed
- Better performance than traditional hybrid apps

### 2. Frontend Framework
**Decision**: React with TypeScript
**Rationale**:
- Large ecosystem and community support
- Type safety with TypeScript
- Component reusability
- Excellent developer experience

### 3. State Management
**Decision**: Zustand over Redux or Context API
**Rationale**:
- Minimal boilerplate
- TypeScript-first design
- Small bundle size
- Simple learning curve

### 4. Authentication Service
**Decision**: Clerk managed authentication
**Rationale**:
- Built-in UI components
- Social login support
- Secure by default
- Easy integration with React

### 5. AI Integration
**Decision**: Google Gemini API for nutrition analysis
**Rationale**:
- Advanced language understanding
- Accurate nutrition data extraction
- Cost-effective pricing
- Good API documentation

### 6. Deployment Platform
**Decision**: Render for hosting
**Rationale**:
- Simple deployment from GitHub
- Automatic SSL certificates
- Built-in PostgreSQL support
- Cost-effective for startups

## Project Structure

```
wellness-app/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── features/     # Feature-specific components
│   │   ├── forms/        # Form components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Base UI components
│   ├── context/          # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API and external services
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── android/              # Android platform files
├── ios/                  # iOS platform files
└── docs/                 # Documentation

```

## Data Flow

1. **User Actions** → React Components
2. **State Updates** → Zustand Stores
3. **API Calls** → Service Layer
4. **External APIs** → Gemini, Clerk, Health APIs
5. **Data Storage** → PostgreSQL (server), localStorage (client)

## Security Considerations

1. **Authentication**: All routes requiring auth are protected
2. **API Keys**: Environment variables, never in code
3. **Data Encryption**: HTTPS everywhere
4. **Health Data**: Follows platform guidelines (HealthKit/Google Fit)
5. **User Privacy**: Minimal data collection, clear privacy policy

## Performance Optimizations

1. **Code Splitting**: Lazy loading for routes
2. **Image Optimization**: WebP format, lazy loading
3. **Caching**: Service worker for offline support
4. **Bundle Size**: Tree shaking, minimal dependencies
5. **API Calls**: Debouncing, request caching

## Deployment Strategy

1. **Development**: Local development with hot reload
2. **Staging**: Automatic deployment on staging branch push
3. **Production**: Manual approval required, then auto-deploy
4. **Mobile**: Capacitor build → App Store/Play Store

## Future Considerations

1. **Scalability**: Consider microservices if user base grows
2. **Real-time**: WebSocket for group features
3. **Analytics**: Add Mixpanel or Amplitude
4. **Monitoring**: Implement Sentry for error tracking
5. **Testing**: Increase test coverage to 80%+