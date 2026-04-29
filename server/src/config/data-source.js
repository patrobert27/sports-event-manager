require('reflect-metadata');
require('dotenv').config();
const { DataSource } = require('typeorm');

const Role = require('../entities/Role');
const User = require('../entities/User');
const Activity = require('../entities/Activity');
const Field = require('../entities/Field');
const Competition = require('../entities/Competition');
const Group = require('../entities/Group');
const Team = require('../entities/Team');
const TeamPlayer = require('../entities/TeamPlayer');
const Match = require('../entities/Match');
const MatchEvent = require('../entities/MatchEvent');
const Standing = require('../entities/Standing');
const MatchdayPrediction = require('../entities/MatchdayPrediction');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jornades_db',
  entities: [
    Role,
    User,
    Activity,
    Field,
    Competition,
    Group,
    Team,
    TeamPlayer,
    Match,
    MatchEvent,
    Standing,
    MatchdayPrediction
  ],
  migrations: ['src/migrations/*.js'],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});

module.exports = { AppDataSource };