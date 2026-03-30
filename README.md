# Revolutic Invoice Mobile App

Welcome to the **Revolutic Invoice Mobile App**! This application is a comprehensive invoice and billing management solution built with modern mobile development technologies, offering an intuitive interface to handle customers, items, invoices, and payments on the go.

## Features

- **Authentication**: Secure login and user session management.
- **Dashboard**: Quick overview of your business metrics and activity.
- **Invoice Management**: Create, edit, view, and send professional invoices.
- **Customer Management**: Maintain a directory of your clients/customers easily.
- **Item/Product Management**: Keep track of the products or services you offer, including prices and descriptions.
- **Payment Tracking**: Record and monitor payments received from customers.
- **PDF Generation**: Generate PDF invoices to share easily or print directly from the app.
- **Rich User Interface**: Sleek, responsive, and accessible UI powered by NativeWind (Tailwind CSS for React Native).
- **Data Visualization**: View metrics and insights through interactive charts.

## Tech Stack

| Concern | Technology |
| :--- | :--- |
| Framework | React Native / Expo |
| Routing | Expo Router |
| Styling | NativeWind (Tailwind CSS for React Native) |
| Data Fetching / API | Axios |
| UI & Typography | Expo Vector Icons & Google Fonts |
| Charts & Analytics | Gifted Charts & Chart Kit |
| Rich Text Editor | React Native CN Quill |
| PDF Generation | Expo Print & HTML to PDF |

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- `npm`, `yarn`, or `pnpm`
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (for macOS users) or Android Studio Emulator for local testing.

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd Revolutic-Invoice-Mobile-App
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Ensure your API backend running and configured correctly. Check `utils/IP.ts` or any environment configurations to match your backend service IP/URL.

## Running the App

1. **Start the Expo development server**:
   ```bash
   npm start
   ```

2. **Open the App**:
   - Press **`a`** in the terminal to open the app on an Android Emulator.
   - Press **`i`** in the terminal to open the app on an iOS Simulator.
   - Install **Expo Go** on your physical Android/iOS device and scan the QR code displayed in the terminal.

## Available Scripts

- `npm start` - Starts the Expo development server.
- `npm run android` - Runs the application on a connected Android device or emulator.
- `npm run ios` - Runs the application on a connected iOS device or simulator.
- `npm run web` - Starts the app in web mode (if supported and configured).
- `npm run lint` - Runs Expo linting to ensure code quality formatting.

## Contributing

Contributions are always welcome! Please follow these steps if you wish to contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---
*Built with React Native & Expo.*
