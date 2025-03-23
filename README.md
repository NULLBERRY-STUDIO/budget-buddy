# Budget Buddy Berlin

![Budget Buddy Berlin](https://res.cloudinary.com/dm9gvqa1t/image/upload/v1742759621/fffkfjgjgjririeo83930848393.png)

A modern web application that helps users calculate affordable rent in Berlin based on their income and expenses.

## Overview

Budget Buddy Berlin is a user-friendly tool that helps individuals and families:

- Calculate affordable rent based on income and recommended budget percentages
- View a breakdown of monthly expenses with customizable categories
- Find affordable neighborhoods in Berlin based on their budget
- Visualize neighborhood data on an interactive map
- Access all features in multiple languages

## Features

- **Rent Calculator**: Input your monthly income, select budget type (single/family), and adjust rent percentage to see what you can afford
- **Expense Breakdown**: Detailed visualization of monthly budget allocation with customizable expense categories
- **Neighborhood Finder**: Discover Berlin neighborhoods that match your budget with detailed information about each area
- **Interactive Map**: Visual representation of Berlin neighborhoods with affordability indicators
- **Multilingual Support**: Available in 9 languages: English, German, Spanish, French, Polish, Russian, Turkish, Arabic, and Urdu
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred theme for comfortable viewing

## Technologies Used

This project is built with modern web technologies:

- **Vite** - Next Generation Frontend Tooling
- **TypeScript** - Type-safe JavaScript
- **React** - UI Framework
- **React Router** - For navigation
- **React Query** - For data fetching
- **shadcn/ui** - Beautifully designed components
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet/React-Leaflet** - For interactive maps
- **Recharts** - For data visualization
- **i18next** - Internationalization support
- **Zod** - For form validation

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd budgetbuddy-berlin

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Development

You can edit the code using:

**Local Development**
- Use your preferred IDE
- Clone the repository
- Install dependencies and start the development server
- Changes can be previewed instantly with auto-reloading

**GitHub Codespaces**
- Navigate to the repository's main page
- Click on the "Code" button and select "Open with Codespaces"
- Create a new codespace or select an existing one
- The development environment will be set up automatically

## Building for Production

```sh
# Build the project for production
npm run build

# Preview the production build locally
npm run preview
```

## Project Structure

```
budgetbuddy-berlin/
├── public/               # Static assets and data files
│   ├── data/             # JSON data for neighborhoods and expenses
│   ├── favicon.ico       # Favicon
│   └── favicon.svg       # Vector favicon
├── src/
│   ├── components/       # React components
│   │   └── ui/           # UI components from shadcn/ui
│   ├── context/          # React context providers
│   ├── data/             # Data fetching and processing
│   ├── hooks/            # Custom React hooks
│   ├── i18n/             # Internationalization files
│   │   ├── en.json       # English translations
│   │   ├── de.json       # German translations
│   │   └── ...           # Other language translations
│   ├── lib/              # Utility functions
│   └── pages/            # Page components
└── index.html            # Entry HTML file
```

## Internationalization

Budget Buddy Berlin supports 9 languages:
- English (en)
- German (de)
- Spanish (es)
- French (fr)
- Polish (pl)
- Russian (ru)
- Turkish (tr)
- Arabic (ar)
- Urdu (ur)

The application automatically detects the user's browser language and displays content accordingly. Users can also manually switch languages from the UI.

## Design System

The application follows a clean, minimal design inspired by Bauhaus principles with:
- Consistent neutral color system for light and dark modes
- Typography-focused presentation
- Clean lines and consistent spacing
- Accessible UI elements

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Created By

Budget Buddy Berlin is developed by Nullberry Studio, an indie software studio dedicated to crafting better software & tools—no subscriptions, no ads, no hidden monetization tricks.
