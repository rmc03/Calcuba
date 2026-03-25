# Calcuba - Cuban Currency Calculator

A modern mobile calculator app for Cuban currency with real-time exchange rates, designed with iOS-style aesthetics.

## Features

### 🧮 Calculator
- Basic arithmetic operations (+, -, ×, ÷)
- Scientific functions: sin, cos, tan, log, ln, √, x², 1/x
- Percentage calculations
- Sign toggle (+/-)
- Backspace support

### 💱 Currency Converter
- Real-time exchange rates from informal Cuban market
- Supported currencies: CUP, USD, EUR, MLC
- Offline mode with cached rates
- Pull-to-refresh functionality

### 💵 Billetes (Cash Counter)
- Cuban peso denominations: $1000, $500, $200, $100, $50, $20, $10, $5, $3
- Cuban coins: $1, 50¢, 25¢, 20¢, 5¢, 2¢, 1¢
- Real-time total calculation
- Piece count summary

### 🌙 Dark/Light Theme
- Automatic theme detection
- Manual toggle available
- Persists user preference

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State**: React Context + AsyncStorage
- **Icons**: Ionicons (SF Symbols equivalent)
- **API**: eltoque.com (informal exchange rates)

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
CalcubaApp/
├── app/                    # Expo Router screens
│   ├── index.tsx           # Calculator screen
│   ├── conversor.tsx      # Currency converter screen
│   ├── billets.tsx        # Cash counter screen
│   └── _layout.tsx        # Navigation layout
├── constants/              # Theme & colors
│   ├── colors.ts          # iOS-style color palette
│   └── theme.ts           # Typography, spacing, shadows
├── context/                # React Context
│   └── ThemeContext.tsx   # Dark/light theme management
├── package.json
└── app.json               # Expo configuration
```

## Design System

### Colors (iOS 18 Style)
- Primary accent: #007AFF (iOS Blue)
- Secondary accent: #FF9500 (iOS Orange)
- Success: #34C759 (iOS Green)
- Dark mode backgrounds: #1C1C1E, #2C2C2E
- Light mode backgrounds: #F2F2F7, #FFFFFF

### Typography
- iOS: System font (SF Pro)
- Android: sans-serif
- Monospace: Menlo/Monospace

## API Reference

Exchange rates fetched from:
```
GET https://api.eltoque.com/v1/trm?date=today
```

Rates are cached locally using AsyncStorage for offline use.

## License

MIT License