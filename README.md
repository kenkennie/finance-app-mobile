# ExpenseFlow Mobile App

A cross-platform React Native mobile application for personal finance management, built with Expo and modern React Native technologies.

## 🚀 Features

### Core Financial Management
- **Multi-Account Tracking**: Manage bank accounts, credit cards, and cash accounts
- **Expense & Income Tracking**: Record transactions with detailed categorization
- **Budget Management**: Set spending limits and monitor budget performance
- **Financial Insights**: Visualize spending patterns with interactive charts
- **Offline Support**: Core functionality works without internet connection

### User Experience
- **Cross-Platform**: Native iOS and Android experience
- **Intuitive UI**: Clean, modern interface with smooth animations
- **Real-time Sync**: Instant synchronization with the backend API
- **Push Notifications**: Stay updated on budget limits and recurring transactions
- **Biometric Authentication**: Secure login with fingerprint/face recognition

### Security & Privacy
- **Secure Authentication**: JWT-based authentication with secure token storage
- **Google OAuth**: Quick sign-in with Google accounts
- **Data Encryption**: Sensitive data encrypted at rest
- **Privacy Controls**: Granular privacy settings and data sharing controls

## 🛠️ Technology Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand for global state
- **API Client**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Custom components with Lucide React Native icons
- **Charts**: Victory Native for data visualization
- **Storage**: AsyncStorage with encryption
- **Authentication**: SecureStore for sensitive data

## 📋 Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g @expo/cli`
- For iOS: macOS with Xcode
- For Android: Android Studio or Expo Go app

## 🏗️ Installation & Setup

### 1. Install Dependencies

```bash
cd mobile
pnpm install
```

### 2. Environment Configuration

Create environment files for different environments:

```bash
# Development
cp .env.example .env

# Production
cp .env.example .env.production
```

Configure the following variables:
```env
# API Configuration
API_BASE_URL=http://localhost:3000/api
API_TIMEOUT=10000

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_REDIRECT_URI=your-redirect-uri

# App Configuration
APP_NAME=ExpenseFlow
APP_VERSION=1.0.0
```

### 3. Start Development Server

```bash
# Start Expo development server
pnpm start

# Or use specific commands
pnpm android  # Android emulator
pnpm ios      # iOS simulator
pnpm web      # Web browser
```

### 4. Run on Device

- **Expo Go**: Scan QR code with Expo Go app
- **Development Build**: Build custom development client
- **Physical Device**: Connect device and select from Expo CLI

## 📱 App Structure

```
mobile/
├── app/                    # App screens (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Welcome screen
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   └── charts/           # Chart components
├── store/                # Zustand state management
│   ├── auth.ts           # Authentication state
│   ├── finance.ts        # Financial data state
│   └── settings.ts       # App settings state
├── theme/                # Styling and themes
│   ├── colors.ts         # Color definitions
│   ├── fonts.ts          # Font configurations
│   └── index.ts          # Theme exports
├── shared/               # Shared utilities
│   ├── constants/        # App constants
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
├── config/               # Configuration files
│   ├── api.ts           # API configuration
│   └── navigation.ts    # Navigation configuration
└── schemas/              # Zod validation schemas
```

## 🔐 Authentication Flow

The app supports multiple authentication methods:

1. **Email/Password**: Traditional login with secure password storage
2. **Google OAuth**: Seamless sign-in with Google accounts
3. **Biometric**: Fingerprint/face recognition for quick access
4. **Token Refresh**: Automatic token renewal for uninterrupted sessions

## 💰 Core Features

### Account Management
- Add/edit/delete financial accounts
- Track account balances in real-time
- Support for multiple currencies
- Account-specific transaction history

### Transaction Tracking
- Quick expense/income entry
- Split transactions support
- Receipt photo attachment
- Category assignment with custom icons
- Recurring transaction setup

### Budget Management
- Create category-based budgets
- Real-time spending tracking
- Budget alerts and notifications
- Historical budget performance

### Analytics & Insights
- Spending breakdown by category
- Monthly/yearly trends
- Budget vs actual comparisons
- Export financial reports

## 🎨 UI/UX Design

### Design System
- **Colors**: Consistent color palette with light/dark theme support
- **Typography**: Readable font hierarchy with proper scaling
- **Icons**: Lucide React Native icons for consistency
- **Spacing**: Standardized spacing system
- **Components**: Reusable component library

### Navigation
- **Tab Navigation**: Bottom tabs for main sections
- **Stack Navigation**: Screen transitions with headers
- **Modal Navigation**: Overlay screens for forms and details
- **Deep Linking**: Direct navigation to specific screens

## 🔧 Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for consistent formatting
- Husky pre-commit hooks

### State Management
- **Zustand**: Simple, fast state management
- **TanStack Query**: Server state management with caching
- **AsyncStorage**: Persistent local storage
- **SecureStore**: Encrypted sensitive data storage

### API Integration
- Centralized API client configuration
- Request/response interceptors
- Error handling and retry logic
- Offline queue for failed requests

### Testing
- Jest for unit testing
- React Native Testing Library for component tests
- E2E testing with Detox (planned)

## 🚀 Deployment

### Build Development Client

```bash
# Install EAS CLI
npm install -g @eas/cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for platforms
eas build --platform ios
eas build --platform android
```

### Production Deployment

```bash
# Create production build
eas build --platform all --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

## 📊 Performance Optimization

- **Code Splitting**: Route-based code splitting with Expo Router
- **Image Optimization**: Automatic image compression and caching
- **List Virtualization**: Efficient rendering of large lists
- **Memoization**: React.memo and useMemo for performance
- **Bundle Analysis**: Monitor bundle size and dependencies

## 🔒 Security

- **Secure Storage**: Sensitive data stored in SecureStore
- **Certificate Pinning**: SSL certificate validation
- **Code Obfuscation**: JavaScript code protection in production
- **Runtime Security**: Jailbreak detection and tampering prevention

## 🐛 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
# Clear Metro cache
npx expo start --clear

# Reset project
pnpm run reset-project
```

**Android build issues:**
- Ensure Android SDK is properly configured
- Check device/emulator compatibility
- Verify build tools versions

**iOS build issues:**
- Ensure Xcode is up to date
- Check provisioning profiles
- Verify iOS deployment target

### Debug Mode

```bash
# Enable debug mode
pnpm start --dev-client

# View logs
npx expo install @expo/cli
expo logs
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs)
- [ExpenseFlow API Documentation](../api/README.md)
- [Database Schema](../docs/database-schema.md)

## 🤝 Contributing

1. Follow the established code style and conventions
2. Write tests for new features
3. Update documentation for UI/UX changes
4. Test on both iOS and Android platforms
5. Ensure accessibility compliance

## 📞 Support

For mobile app support:
- Check the troubleshooting section above
- Review the API documentation for backend integration
- Create issues in the GitHub repository
- Join our Discord community for real-time help

---

Built with ❤️ using React Native, Expo, and modern mobile development practices
