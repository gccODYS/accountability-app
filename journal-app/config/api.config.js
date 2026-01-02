/**
 * API Configuration
 *
 * Contains the base URL for the backend API.
 * Update the IP address to match your computer's local network IP.
 *
 * To get your local IP:
 * - macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
 * - Windows: ipconfig
 */

// Use your computer's local IP address for development
// Both phone and computer must be on the same WiFi network
const API_BASE_URL = 'http://192.168.5.241:8000/api';

// Health check endpoint (different path)
const API_HEALTH_URL = 'http://192.168.5.241:8000/health';

export { API_BASE_URL, API_HEALTH_URL };
