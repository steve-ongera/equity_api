# Equity Mobile Banking App Clone

A secure mobile banking application clone featuring a Django REST Framework backend and a React frontend.

## Features
- **Dual Identifier Login**: Authenticate using Email or Phone number.
- **Enhanced Signup Security**: Multi-factor recovery questions (Pet, Food, Nickname, Color).
- **Auto-Session Timeout**: Logs users out automatically after 1 minute of inactivity with warning state.
- **Adaptive Theme**: Global light and dark mode support.
- **Core Banking Modules**: Dashboard, Profile, Settings, Transactions, Send Money, Withdraw, Deposit, Savings, and Reports.

## Tech Stack
- **Backend**: Python, Django, Django REST Framework, JWT Authentication
- **Frontend**: React, Vite, Bootstrap, Bootstrap Icons

## Installation & Setup

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install django djangorestframework djangorestframework-simplejwt django-cors-headers`
5. Run migrations: `python manage.py migrate`
6. Start server: `python manage.py runserver`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
