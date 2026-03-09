# Mapic Client Application

A React Native mobile application built with Expo, featuring location tracking, real-time chat, and social networking capabilities.

## Architecture Overview

This project follows a **3-layer architecture** with **feature-based organization**:

- **Presentation Layer**: UI components and screens
- **Business Logic Layer**: Services and data transformation
- **Data Layer**: State management and persistence

## Project Structure

```
client/
├── app/                          # Expo Router (file-based routing)
│   ├── (auth)/                  # Authentication screens group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   ├── verify-otp.tsx
│   │   └── reset-password.tsx
│   ├── (app)/                   # Protected app screens group
│   │   └── (tabs)/              # Tab navigation
│   │       ├── index.tsx        # Map/Home screen
│   │       ├── chat.tsx
│   │       ├── friends.tsx
│   │       ├── feed.tsx
│   │       └── settings.tsx
│   ├── _layout.tsx              # Root layout
│   └── index.tsx                # Entry point
│
├── src/
│   ├── features/                # Feature modules (domain-driven)
│   │   ├── auth/
│   │   │   ├── components/      # Auth-specific components
│   │   │   ├── hooks/           # Auth-specific hooks
│   │   │   ├── types/           # Auth-specific types
│   │   │   └── index.ts         # Public API
│   │   ├── map/
│   │   ├── chat/
│   │   └── profile/
│   │
│   ├── shared/                  # Shared/reusable code
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── hooks/               # Custom hooks
│   │   ├── utils/               # Utility functions
│   │   │   ├── validation.utils.ts
│   │   │   ├── format.utils.ts
│   │   │   ├── error.utils.ts
│   │   │   └── logger.utils.ts
│   │   ├── types/               # Shared TypeScript types
│   │   │   ├── user.types.ts
│   │   │   ├── location.types.ts
│   │   │   ├── api.types.ts
│   │   │   └── error.types.ts
│   │   └── constants/           # App constants
│   │       ├── api.constants.ts
│   │       ├── app.constants.ts
│   │       └── theme.constants.ts
│   │
│   ├── services/                # Business logic & API communication
│   │   ├── api/
│   │   │   └── client.ts        # Axios API client
│   │   ├── auth/
│   │   │   └── auth.service.ts  # Authentication service
│   │   └── location/
│   │       └── location.service.ts
│   │
│   ├── store/                   # State management
│   │   └── contexts/            # React Context providers
│   │       ├── AuthContext.tsx
│   │       └── LocationContext.tsx
│   │
│   └── assets/                  # Static assets
│       └── images/
│
└── types/                       # Global type definitions
    ├── navigation.types.ts
    └── index.ts
```

## Key Design Principles

### 1. Feature-Based Organization
Code is organized by feature/domain rather than by file type. Each feature module is self-contained with its own components, hooks, types, and utilities.

### 2. Separation of Concerns
- **UI Components**: Only handle presentation and user interaction
- **Services**: Handle business logic and API communication
- **Contexts**: Manage global state
- **Hooks**: Encapsulate reusable logic

### 3. Type Safety
Full TypeScript coverage with explicit types for all functions, components, and data structures.

### 4. Public APIs
Each feature module exports a public API through `index.ts`, hiding internal implementation details.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

### Environment Setup

Create a `.env` file in the root directory (if needed):
```
API_BASE_URL=http://your-api-url.com
```

## Coding Conventions

### File Naming
- **Components**: PascalCase (e.g., `LoginForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase with `.utils.ts` suffix (e.g., `validation.utils.ts`)
- **Types**: camelCase with `.types.ts` suffix (e.g., `user.types.ts`)
- **Constants**: camelCase with `.constants.ts` suffix (e.g., `api.constants.ts`)

### Component Structure
```typescript
// Imports
import React from 'react';
import { View, Text } from 'react-native';

// Types
interface MyComponentProps {
  title: string;
  onPress: () => void;
}

// Component
export const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  // Hooks
  const [state, setState] = React.useState();

  // Handlers
  const handlePress = () => {
    // logic
    onPress();
  };

  // Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### Service Pattern
```typescript
// Service interface
interface MyService {
  getData(): Promise<Data>;
  updateData(data: Data): Promise<void>;
}

// Service implementation
class MyServiceImpl implements MyService {
  async getData(): Promise<Data> {
    // implementation
  }

  async updateData(data: Data): Promise<void> {
    // implementation
  }
}

// Export singleton instance
export const myService = new MyServiceImpl();
```

### Custom Hooks
```typescript
export const useMyFeature = () => {
  const [state, setState] = useState();

  useEffect(() => {
    // side effects
  }, []);

  const doSomething = useCallback(() => {
    // logic
  }, []);

  return {
    state,
    doSomething,
  };
};
```

### Error Handling
```typescript
try {
  const result = await service.doSomething();
  return result;
} catch (error) {
  logger.error('Operation failed', { error });
  throw transformError(error);
}
```

### Import Order
1. React and React Native imports
2. Third-party libraries
3. Absolute imports from `@/` (aliased paths)
4. Relative imports
5. Type imports (if not inline)

```typescript
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';

import { Button } from '@/shared/components';
import { useAuth } from '@/features/auth';

import { LocalComponent } from './LocalComponent';
import type { MyType } from './types';
```

## State Management

### Context Pattern
We use React Context API for global state management:

```typescript
// 1. Define context value type
interface MyContextValue {
  data: Data | null;
  isLoading: boolean;
  fetchData: () => Promise<void>;
}

// 2. Create context
const MyContext = createContext<MyContextValue | undefined>(undefined);

// 3. Create provider
export const MyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await service.getData();
      setData(result);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MyContext.Provider value={{ data, isLoading, fetchData }}>
      {children}
    </MyContext.Provider>
  );
};

// 4. Create hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

## Testing

### Running Tests
```bash
npm test
```

### Test Organization
- Unit tests: Co-located with source files (`.test.ts` or `.test.tsx`)
- Integration tests: In `__tests__` directories
- Test utilities: In `src/shared/utils/test.utils.ts`

## Common Tasks

### Adding a New Feature
1. Create feature directory: `src/features/my-feature/`
2. Add subdirectories: `components/`, `hooks/`, `types/`, `utils/`
3. Create `index.ts` to export public API
4. Implement feature components and logic
5. Add screen in `app/` directory if needed

### Adding a New Service
1. Create service directory: `src/services/my-service/`
2. Define service interface
3. Implement service class
4. Export singleton instance
5. Add service to appropriate context if needed

### Adding a New Shared Component
1. Create component in `src/shared/components/`
2. Export from `src/shared/components/index.ts`
3. Add TypeScript types for props
4. Document usage with JSDoc comments

## Troubleshooting

### Common Issues

**Metro bundler cache issues:**
```bash
npx expo start -c
```

**iOS build issues:**
```bash
cd ios && pod install && cd ..
```

**TypeScript errors:**
```bash
npm run type-check
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)

## Contributing

1. Follow the coding conventions outlined above
2. Ensure TypeScript types are properly defined
3. Write tests for new features
4. Update documentation as needed
