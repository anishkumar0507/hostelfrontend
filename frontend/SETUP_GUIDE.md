# HostelEase - Quick Setup & Usage Guide

## Installation

### 1. Install Dependencies

```bash
# Frontend dependencies (if not already installed)
npm install

# Backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

Frontend `.env`:
```
VITE_API_BASE_URL=https://hostelbackend-98mc.onrender.com/api
```

Backend `.env`:
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
PORT=5000
NODE_ENV=development
```

### 3. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Access the app at: **http://localhost:3001**

---

## Usage Guide

### Role: STUDENT

#### Profile & Location
1. Login with student credentials
2. Go to **My Profile**
3. Location sharing section:
   - **Auto Tracking**: Runs automatically every 30 seconds
   - **Status**: Live/Waiting/Permission-Denied badge
   - If permission denied: Enable location in browser settings

#### Location Sharing
- âœ… **Automatic**: App tracks location every 30 seconds
- âœ… **Background**: Tracking continues while app is open
- âŒ **Cannot disable**: Only warden can toggle
- â„¹ï¸ **Permission**: Grant browser geolocation permission on first prompt

---

### Role: PARENT/GUARDIAN

#### View Child's Location

1. **Dashboard**
   - Click **"Live Location"** card
   - See child's current position

2. **Location Page** (`/parent/location`)
   - **Live Status**: Green if sharing enabled
   - **Coordinates**: Lat/Lng with accuracy
   - **Google Maps**: Click to view on map
   - **History Timeline**: 24-hour movement trail
     - Each point shows time and coordinates
     - Scroll to see past 24 hours

#### Understanding History Timeline
- ðŸŸ¦ Blue dots = Location points at different times
- â° Times shown in 12-hour format (24-hour data)
- ðŸ“ Each entry includes: Time, Latitude, Longitude, Accuracy

---

### Role: WARDEN

#### Live Location Tracking Dashboard

**Access**: Sidebar â†’ **"Live Location Tracking"** or `/warden/locations`

#### Left Panel: Student List
- **Search**: Find by name or roll number
- **Filter**: Filter by hostel block
- **Status**: 
  - ðŸŸ¢ Live (green badge) = Location sharing active
  - âš« Offline (dark badge) = No location data
- **Click**: Select a student to view details

#### Right Panel: Selected Student Details
- **Info**: Name, roll, email, room, block
- **Live Location**:
  - Latitude/Longitude with 6 decimal precision
  - Accuracy in meters
  - Last update timestamp
  - Direct Google Maps link
- **24-Hour Trail**:
  - Timeline of all location points
  - Time and coordinates for each point
  - Movement pattern visualization

#### Managing Students

**Toggle Tracking**:
1. Go to **Student List** (sidebar)
2. Hover over a student row
3. Click edit button
4. Use toggle to enable/disable location tracking

**View Individual Students**:
- From Student List, click on any student
- See live location if sharing enabled
- View 24-hour movement history

#### Data & Updates
- **Auto-refresh**: Every 30 seconds
- **Manual refresh**: Click "Refresh" button
- **History**: 24 hours by default, up to 30 days available
- **Retention**: Data kept for 30 days then auto-deleted

---

## Features Overview

### Automatic Location Tracking
âœ… **How it works**:
1. Student logs in
2. Geolocation permission requested
3. If granted: Background tracking every 30 seconds
4. If denied: Shows warning, can retry in settings

### Real-Time Updates
âœ… **Live Data**:
- Location updates sent every 30 seconds
- Accuracy metrics captured
- Backend broadcasts to warden/parent

### History & Analytics
âœ… **Movement Trail**:
- 24-hour history by default
- Up to 30-day historical data
- Timestamp and accuracy for each point
- Interactive timeline visualization

### Role-Based Access
âœ… **Security**:
- Students: Can only see own status
- Parents: Can only see child's location
- Wardens: Can see all students' locations
- Admin control: Only warden can enable/disable tracking

---

## Troubleshooting

### Location Not Updating
**Problem**: "Waiting" status persists
**Solution**:
1. Check browser location permission
2. Settings â†’ Privacy & Security â†’ Location â†’ Allow
3. Reload app
4. Check backend is running on https://hostelbackend-98mc.onrender.com

### Permission Denied
**Problem**: Shows "Permission Denied" badge
**Solution**:
1. Click browser location icon next to URL
2. Change permission to "Allow"
3. Refresh page
4. App will start tracking again

### History Not Showing
**Problem**: Timeline is empty
**Solution**:
1. Check if location sharing is enabled
2. Wait 30 seconds for first update
3. Some students might not have moved yet
4. Check last update time - data must be fresh

### Map Link Not Working
**Problem**: Google Maps doesn't open
**Solution**:
1. Coordinates might be invalid
2. Wait for student to move/get fresh data
3. Try copying coordinates to Google Maps manually

### Slow Dashboard Loading
**Problem**: Warden dashboard takes time to load
**Solution**:
1. Check internet connection
2. Verify backend is running
3. Close other tabs with the app
4. Clear browser cache
5. Check MongoDB connection status

---

## API Endpoints Reference

### Location APIs

**Student Update Location**
```
POST /api/location/update
Headers: Authorization: Bearer {token}
Body: { lat: number, lng: number, accuracy?: number }
```

**Get Student's Live Location**
```
GET /api/location/:studentId
Headers: Authorization: Bearer {token}
Response: { lat, lng, accuracy, lastUpdated, isSharingEnabled }
```

**Get Location History (24h default, up to 30 days)**
```
GET /api/location/history/:studentId?since=ISO_DATE
Headers: Authorization: Bearer {token}
Response: { points: [{ lat, lng, accuracy, timestamp }, ...] }
```

**Warden: Get All Students with Locations**
```
GET /api/students/locations/all
Headers: Authorization: Bearer {token}
Response: Students array with current locations
```

**Warden: Enable/Disable Tracking**
```
PUT /api/location/:studentId/tracking
Headers: Authorization: Bearer {token}
Body: { enabled: boolean }
```

**Report Permission Status**
```
POST /api/location/permission
Headers: Authorization: Bearer {token}
Body: { permissionGranted: boolean }
```

---

## Settings & Configuration

### Location Update Interval
Currently: **30 seconds**
To change: Edit `pages/Profile.tsx` line 62
```typescript
}, 30 * 1000);  // Change 30 to desired seconds
```

### History Retention
Currently: **30 days**
To change: Edit `controllers/location.controller.js` line 124
```javascript
const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);  // Change 30 to desired days
```

### Auto-Refresh Dashboard
Currently: **30 seconds**
To change: Edit `pages/warden/LocationTracking.tsx` line 73
```typescript
const interval = setInterval(fetchStudents, 30000);  // Change 30000 to desired ms
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` (on dashboard) | Focus search box |
| `Esc` | Close modals/popups |
| `Enter` | Submit forms |

---

## Performance Tips

1. **Close old browser tabs** with the app to reduce server load
2. **Use Chrome/Edge** for best performance
3. **Don't refresh constantly** - auto-refresh is automatic
4. **Check internet speed** if history loads slowly
5. **Keep backend running** in a dedicated terminal window

---

## Support & Documentation

For more details, see:
- **IMPLEMENTATION_SUMMARY.md** - Full technical documentation
- **Backend README.md** - Backend specific setup
- **Frontend package.json** - All dependencies

---

## Demo Credentials

Use these accounts to test the system:

```
WARDEN:
Email: warden@hostelease.com
Password: (Set during first login)

STUDENT:
Email: student@hostelease.com
Password: (Set during first login)

PARENT:
Email: parent@hostelease.com
Password: (Set during first login)
```

---

**Last Updated**: February 2026  
**Version**: 2.0.0 - Location Tracking Edition

