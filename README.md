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

Currently, this is a personal project to organize sports events for a school, which I’ve had no more than two weeks to work on while also working my 9-to-5 job

Because of that, there are some things that could have been done better, such as

- There are no tests.
- There is no documentation.
- I’m not using validation libraries like Zod; instead, I rely on basic validations.
- A lots of things, but...

**IN THE NEAR FUTURE**, I will try to add all of these things so that the project becomes more robust and professional.

The goal is to have an application that facilitates the organization of school sports events, allowing organizers to manage teams, matches, standings, registrations, players, referees, facilities, etc
