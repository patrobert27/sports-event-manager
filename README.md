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
