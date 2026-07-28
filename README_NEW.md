# Hostel Expense Manager

Hostel Expense Manager is a production-ready Progressive Web App for managing hostel expenses, category tracking, and reporting. It uses React 19, TypeScript, Firebase, Tailwind CSS, and PWA features.

## Features

- Firebase Authentication with email/password login and password reset
- Protected dashboard and expense pages
- Expense tracking by title, category, payment method, person, and date
- Responsive mobile, tablet, and desktop UI
- PWA installable with offline asset caching
- Firebase Storage bill image upload support
- Clean architecture with reusable components and shared types

## Project structure

- `src/components` — reusable UI components and layout shell
- `src/pages` — route views and page screens
- `src/services` — Firebase auth, Firestore, and storage services
- `src/contexts` — app context providers
- `src/hooks` — custom hooks
- `src/types` — shared TypeScript models
- `src/utils` — helper functions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview the production build:
   ```bash
   npm run preview
   ```

## Firebase deployment

1. Install Firebase CLI if needed:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Initialize Firebase in the project directory:
   ```bash
   firebase init
   ```

   - Select Hosting, Firestore, and Storage
   - Use `dist` as the public directory
   - Configure as a single-page app
4. Deploy to Firebase Hosting:
   ```bash
   firebase deploy
   ```

## Configuration

- Update Firebase settings in `src/services/firebase.ts` with your project credentials.
- Firestore rules are in `firestore.rules`.
- Storage rules are in `storage.rules`.
- PWA manifest is in `public/manifest.webmanifest`.

## Notes

- The app uses React Router DOM for route handling.
- Expenses and categories are stored in Firestore collections.
- The UI is designed for speed, accessibility, and responsive layouts.
