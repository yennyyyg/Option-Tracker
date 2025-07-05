```markdown
# OptionTrack

OptionTrack is a professional dark-mode web application designed specifically for options sellers. The app helps users track multiple stock market portfolios across different brokerages, manage options premiums, assignments, and analyze strategies. This tool aims to maximize options selling income while effectively managing risks.

## Overview

OptionTrack is structured into two main parts: frontend and backend.

### Frontend
- **Framework**: ReactJS
- **Development Server**: Vite
- **Component Library**: Shadcn UI components with Tailwind CSS
- **Routing**: `react-router-dom`
- **Folder Structure**: 
  - `client/`: Contains all frontend code.
  - `client/src/pages/`: Contains the page components.
  - `client/src/components/`: Contains the reusable components.
  - `client/src/api/`: Contains API request functions, with mock data implemented for frontend development.

### Backend
- **Framework**: ExpressJS
- **Database**: MongoDB with Mongoose
- **Authentication**: Token-based (bearer access and refresh tokens)
- **Folder Structure**:
  - `server/`: Contains all backend code.
  - `server/routes/`: Defines API routes.
  - `server/models/`: Contains Mongoose schemas.
  - `server/services/`: Encapsulates business logic.
  - `server/middleware/`: Contains middleware functions.

### Data Flow
- **API Requests**: All interactions between the frontend and backend are handled via well-defined API requests.
- **Mock Data**: During development, data is mocked in the `client/src/api` folder to simulate real backend responses.

## Features

### User Interface & Navigation
- **Dashboard**: Overview of all positions and key metrics.
- **Positions**: Detailed view of all holdings and options.
- **Premium Tracker**: Options income tracking and analytics.
- **Assignment Center**: Assignment history and management.
- **Rolling Calendar**: Options expiration timeline and rolling opportunities.
- **Greeks Monitor**: Real-time Greeks tracking across positions.
- **Analytics**: Performance analysis and strategy insights.
- **Risk Alerts**: Notifications and risk management.
- **Settings**: Account and preference management.

### User Interaction Flows
- **New User Onboarding**: Guided setup for new users including brokerage connection and preference configuration.
- **Daily Workflow**: Overview and management of daily trading activities.
- **Options Management**: Tools for expiration identification, position analysis, and action decision.
- **Monthly Review**: Detailed insights and performance reviews to optimize strategies.

## Getting started

### Requirements
- **Node.js** (version 14.x or higher)
- **npm** (version 6.x or higher)
- **MongoDB** (running locally or accessible remotely)

### Quickstart
1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd OptionTrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment configuration:**
   - Copy the `.env.example` file in the `server` folder and rename it to `.env`.
   - Configure the environment variables, including MongoDB connection string, in the `.env` file.

4. **Run the application:**
   ```bash
   npm run start
   ```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

### License

```
Copyright (c) 2024.
```
```
