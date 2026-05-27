# Platform for managing and organizing school sports events

## Getting Started

### Frontend

```bash
cd client/jornades
npm install
cp .env.example .env
```

Update the ``.env`` file with your configuration:
```bash
npm run dev
```

### Backend

Make sure you have Docker or PostgreSQL installed.

Create a PostgreSQL container or database using your own credentials.
```bash
cd server
cp .env.example .env
```
Update the .env file with your Google Auth configuration and database credentials.
```bash
npm install
npm run db:setup
npm run dev
```

## Organization

Currently, this is a personal project to organize sports events for a school

**IN THE NEAR FUTURE**, I will try to add all of these things so that the project becomes more robust and professional.

The goal is to have an application that facilitates the organization of school sports events, allowing organizers to manage teams, matches, standings, registrations, players, referees, facilities, etc
