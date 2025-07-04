# GreenTwin Frontend

This is the frontend application for the GreenTwin tree management system. It provides a user interface for viewing, adding, and watering trees on an interactive map.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up your environment variables by copying `.env.example` to `.env` and adjusting values as needed:
   ```
   cp .env.example .env
   ```

## Running the Application

For development:
```
npm run dev
```

For production:
```
npm run build
npm run preview
```

## Environment Variables

- `VITE_API_URL` - URL of the backend API (default: http://localhost:3000)

## Features

- Interactive map showing tree locations
- User authentication (login/register)
- Add new trees to the map
- Water trees at your current location
- View tree details and watering history

## Technologies Used

- React
- TypeScript
- Vite
- Leaflet for maps
- Axios for API requests
- Tailwind CSS for styling
