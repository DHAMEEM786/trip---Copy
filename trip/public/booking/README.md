# Hotel Booking - Google Places API Integration

A simple hotel booking application that searches for hotels using Google Places API.

## Features

- Search hotels by location
- Filter by keyword (e.g., luxury, budget, beach)
- Adjustable search radius (5km to 50km)
- Display hotel details including:
  - Name and address
  - Ratings and reviews
  - Photos
  - Price level
  - Types/categories
  - Contact information

## Setup

1. Open `index.html` in a web browser
2. The Google Places API key is already embedded in the HTML file
3. Enter a location and click "Search" to find hotels

## Usage

1. Enter a location in the search box (e.g., "New York", "Paris", "Tokyo")
2. Optionally enter a keyword to filter results (e.g., "luxury", "beach")
3. Select a search radius
4. Click "Search" or press Enter
5. Browse the hotel results and click "View Details" for more information

## Files

- `index.html` - Main HTML file
- `style.css` - Styling for the application
- `script.js` - JavaScript code for Google Places API integration

## API Key

The Google Places API key is included in the HTML file. Make sure you have the following APIs enabled in your Google Cloud Console:
- Places API
- Maps JavaScript API
- Geocoding API

## Notes

- Requires an internet connection to access Google Places API
- Make sure the API key has the necessary permissions enabled
- The application uses the Google Places API Nearby Search and Place Details services

