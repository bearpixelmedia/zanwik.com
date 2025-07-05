# Zanwik Dashboard Client

A modern React dashboard application with real-time data, authentication, and comprehensive analytics.

## 🚀 Quick Start

### Production Setup
```bash
# Install dependencies
npm install

# Set up environment variables
./setup-env.sh

# Start development server
npm start
```

### Development Setup (with Git hooks)
```bash
# Install dependencies
npm install

# Set up development environment (includes Husky)
chmod +x setup-dev.sh
./setup-dev.sh

# Start development server
npm start
```

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix auto-fixable issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests

## 🌍 Environment Variables

The application uses the following environment variables:

- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Supabase anonymous key
- `REACT_APP_API_URL` - Backend API URL

## 📊 Features

- **Real-time Dashboard** - Live metrics and analytics
- **User Authentication** - Secure login with Supabase Auth
- **Project Management** - CRUD operations for projects
- **Analytics** - Comprehensive data visualization
- **Monitoring** - System health and alerts
- **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Supabase** - Backend and authentication
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **React Hook Form** - Form handling

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Input validation and sanitization

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 