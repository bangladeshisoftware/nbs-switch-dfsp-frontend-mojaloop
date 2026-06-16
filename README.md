# DFSP Portal - Frontend

A modern React-based frontend portal for **DFSP (Digital Financial Service Provider) operators** within the R Switch ecosystem.

The portal provides DFSP users with a secure and real-time interface to monitor transactions, liquidity positions, settlement activities, deposits, operational logs, and user management — all fully scoped to their own DFSP environment.

> This frontend communicates with the DFSP Portal Backend API and only displays data authorized for the authenticated DFSP user.

---

# Features

## Dashboard

- Real-time operational overview
- Today's transaction statistics
- Yesterday comparison metrics
- Monthly transaction volume
- Current liquidity position
- Recent transactions feed
- Merchant statistics
- Hourly activity charts

---

## Transactions

- View all DFSP transactions
- Filter by:
  - Status
  - Date range
  - Direction (SEND / RECEIVE)
  - Transfer ID

- Transaction detail viewer
- Transaction statistics & charts

---

## Finance Management

### Liquidity

- Current DFSP position
- Net Debit Cap (NDC)
- Reserved amount monitoring
- Central Ledger account integration
- Position change history

### Position History

- Full liquidity movement history
- Reserve / Commit / Rollback tracking
- Historical position analytics

### Finalize Records

- Settlement finalize movement records
- Credit / Debit settlement actions
- Settlement lifecycle monitoring

### Settlement History

- Completed settlement records
- Before/after position snapshots
- Settlement summaries

### Deposits History

- Settlement account deposit history
- Deposit summaries
- Historical deposit tracking

---

## Admin & Authentication

### Secure Authentication

- JWT-based authentication
- OTP verification flow
- Session management
- Secure API communication

### User Management

- DFSP user management
- Role-based access
- Admin / Operator / Viewer roles

### Profile Management

- User profile information
- DFSP details
- Account settings

### Activity Logs

- Login history
- User activity tracking
- Operational audit logs

---

# Tech Stack

| Layer          | Technology      |
| -------------- | --------------- |
| Framework      | React.js        |
| Build Tool     | Vite            |
| Routing        | React Router    |
| HTTP Client    | Axios           |
| UI Icons       | React Icons     |
| State Handling | React Hooks     |
| Styling        | CSS / Custom UI |

---

# Project Structure

```bash
src/
├── assets/
├── components/
├── pages/
├── services/
├── index.css
├── main.jsx
└── App.jsx
```

---

# Environment Setup

Create a `.env.production` file in the project root:

```env
VITE_API_URL=https://your-dfsp-server.com/api/v1
```

Example:

```env
VITE_API_URL=https://api.example.com/api/v1
```

> `VITE_API_URL` should point to your DFSP Backend API server.

---

# Installation

## 1. Clone Repository

```bash
git clone https://github.com/your-org/dfsp-portal-frontend.git
cd dfsp-portal-frontend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment

Create `.env.production`

```env
VITE_API_URL=https://your-dfsp-server.com/api/v1
```

---

## 4. Run Development Server

```bash
npm run dev
```

Frontend runs by default on:

```bash
http://localhost:5174
```

---

# Vite Configuration

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://your-dfsp-server.com',
        // target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```

---

# Navigation Modules

## Dashboard

- Dashboard overview

## Transactions

- Transactions

## Finance Management

- Liquidity
- Positions History
- Finalize Records
- Settlement History
- Deposits History

## Admin / Auth

- Users
- Profile
- Activity Logs

---

# Authentication Flow

```text
Login → OTP Verification → JWT Token → Secure API Access
```

The frontend securely stores authentication tokens and automatically attaches them to authenticated API requests.

---

# API Integration

All API requests are connected to:

```bash
${VITE_API_URL}
```

Example:

```bash
https://your-dfsp-server.com/api/v1
```

---

# Build For Production

```bash
npm run build
```

Production build output:

```bash
dist/
```

---

# Preview Production Build

```bash
npm run preview
```

---

# Security Features

- JWT authentication
- OTP verification support
- Protected routes
- Role-based access control
- Secure API communication
- Automatic unauthorized session handling

---

# Recommended Production Setup

- Use HTTPS
- Configure proper reverse proxy
- Enable secure headers
- Restrict backend CORS
- Store environment variables securely

---

# Backend Requirement

This frontend requires the DFSP Portal Backend API server.

Backend API routes are expected under:

```bash
/api/v1
```

---

# License

Private — R Switch / Bangladeshi Software LTD. All rights reserved.
