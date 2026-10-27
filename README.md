# GoPratle Requirement Posting System

A four-step full-stack requirement posting flow built with Next.js App Router, Bootstrap, Express, and MongoDB.

## Features
- Event basics and date/date-range capture
- Category-specific fields for Planner, Performer, and Crew
- Review step before submission
- Express REST API with validation and MongoDB persistence
- Responsive Bootstrap UI and success/error feedback

## Requirements
- Node.js 20+ recommended
- MongoDB Atlas database or local MongoDB

## 1. Configure the backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and set `MONGODB_URI`. Keep `.env` private; never commit secrets.
```bash
npm run dev
```
Backend runs on `http://localhost:5000`. Check `http://localhost:5000/api/health`.

## 2. Configure the frontend
Open a second terminal:
```bash
cd frontend
npm install
```
Copy `.env.local.example` to `.env.local`.
```bash
npm run dev
```
Open `http://localhost:3000`.

## API
- `GET /api/health` — health check
- `POST /api/requirements` — validate and save a requirement
- `GET /api/requirements` — list saved requirements (simple demo endpoint)

### Example POST body
```json
{
  "eventName": "College Cultural Fest",
  "eventType": "College Event",
  "startDate": "2026-12-15",
  "endDate": "2026-12-15",
  "location": "Chennai",
  "venue": "ABC Engineering College",
  "category": "performer",
  "categoryDetails": {
    "performerType": "Singer",
    "performerCount": 1,
    "durationMinutes": 45,
    "budget": 15000,
    "equipment": "Microphone and speakers",
    "additionalNotes": "Acoustic performance preferred"
  }
}
```

## Deployment
1. Deploy the backend to a Node-compatible host and set `MONGODB_URI`, `PORT` if required, and `CLIENT_ORIGIN` to your deployed frontend origin.
2. Deploy the frontend to Vercel and set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend base URL, for example `https://your-api.example.com/api` (do not add `/requirements`).
3. Redeploy after changing environment variables.
4. Test the live flow end-to-end.

## Assumptions and limitations
- One category is selected per requirement.
- Planner, Performer, and Crew details are stored in a flexible `categoryDetails` object.
- The GET endpoint is provided for demonstration; a production system should add authentication, authorization, pagination, rate limiting, and stricter business rules.
- Budget is a numeric amount; the demo does not impose a currency conversion.
- The app does not include user accounts or editing/deleting existing submissions.
