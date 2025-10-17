# Healthcare Staff Scheduling System - Frontend

This is the frontend application for the Healthcare Staff Scheduling System, built with Next.js, React, and TypeScript.

## Features

- **Admin Panel**: Complete staff scheduling interface matching the provided design
- **Staff Management**: View and manage staff members
- **Schedule Overview**: Calendar view with monthly, weekly, and daily views
- **Staff Assignment**: Assign staff to shifts with conflict detection
- **Schedule Preview**: View and manage existing schedules
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see CSSE-Backend README)

## Installation

1. Navigate to the frontend directory:
   ```bash
   cd CSSE-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Admin Panel Access

1. Navigate to the login page: [http://localhost:3000/login](http://localhost:3000/login)
2. Use the admin credentials:
   - Email: admin@medicare.com
   - Password: admin123
3. You'll be redirected to the admin panel at `/admin`

## Admin Panel Features

### Schedule Overview
- Monthly calendar view with staff assignments
- Navigation between months
- Visual indicators for scheduled shifts
- Add new schedules with the "Add Schedule" button

### Staff Assignment
- View all available staff members
- Filter by department
- Assign staff to shifts
- Real-time availability checking

### Schedule Preview
- Search through existing schedules
- View detailed schedule information
- Edit and save schedule changes
- Status tracking (Scheduled, Confirmed, Cancelled, Completed)

## Component Structure

```
app/
├── admin/
│   ├── page.tsx                    # Main admin page
│   └── components/
│       ├── AdminHeader.tsx         # Header with navigation
│       ├── AdminSidebar.tsx        # Sidebar navigation
│       ├── ScheduleOverview.tsx    # Calendar view
│       ├── StaffAssignment.tsx     # Staff assignment panel
│       ├── SchedulePreview.tsx     # Schedule management
│       └── ScheduleAssignmentModal.tsx # Schedule creation modal
├── components/
│   ├── LoginForm.tsx              # Login form
│   └── RegisterForm.tsx           # Registration form
├── utils/
│   └── api.ts                     # API utility functions
└── types/
    └── appointment.ts             # TypeScript type definitions
```

## API Integration

The frontend communicates with the backend API through:
- Axios for HTTP requests
- Cookie-based authentication
- Error handling and loading states
- Real-time data updates

## Styling

The application uses Tailwind CSS for styling with:
- Responsive design
- Modern UI components
- Consistent color scheme (green theme)
- Accessibility considerations

## Key Features

### Authentication
- Role-based access control
- Secure login/logout
- Session management
- Redirect based on user role

### Staff Scheduling
- Conflict detection
- Availability checking
- Department filtering
- Time slot management

### User Experience
- Intuitive interface
- Loading states
- Error handling
- Responsive design

## Development

To contribute to this project:

1. Follow the existing component structure
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states for better UX
5. Test on different screen sizes
6. Follow React best practices

## Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

Create a `.env.local` file for environment-specific variables:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**: Ensure the backend server is running on port 8000
2. **Authentication Issues**: Check if cookies are enabled in your browser
3. **CORS Errors**: Verify CORS configuration in the backend
4. **Build Errors**: Clear the `.next` folder and rebuild

### Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real-time notifications
- Advanced filtering options
- Export functionality
- Mobile app
- Advanced reporting
- Integration with external calendar systems