# SMD Admin System (React)

React-based admin portal for SMD Microservices Management System.

## Features

- User Authentication & Authorization
- User Management
- Role & Permission Management
- Service Discovery (Eureka Integration)
- Responsive Dashboard

## Setup

### Prerequisites
- Node.js 16+
- npm 7+

### Installation

```bash
cd frontend/admin-system
npm install
```

### Development

```bash
npm start
```

The application will open at `http://localhost:3000`

### Build

```bash
npm run build
```

Production-ready files will be in the `build/` directory.

## Project Structure

```
src/
├── pages/
│   ├── Login.js          # Login page
│   ├── Dashboard.js      # Main dashboard
│   ├── Users.js          # User management
│   ├── Roles.js          # Role & permission management
│   └── Services.js       # Service discovery
├── components/           # Reusable components
├── utils/
│   └── api.js           # API client utilities
├── App.js               # Main app with routing
└── index.css            # Styles
```

## Environment Configuration

Update API endpoints in `src/utils/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8081';  // Auth service
const EUREKA_URL = 'http://localhost:8761';    // Eureka
const CONFIG_SERVER_URL = 'http://localhost:8888';
```

## Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## API Integration

The application connects to:
- Auth Service (port 8081)
- Eureka (port 8761)
- Config Server (port 8888)

## Available Pages

1. **Dashboard** - Overview of services and instances
2. **Users** - User CRUD operations
3. **Roles** - Role and permission management
4. **Services** - Service discovery and status

## Deployment

For production deployment:

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy the `build/` directory to your web server or use Docker.

## Technologies

- React 18
- React Router v6
- ES6+ JavaScript
- CSS3


Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
