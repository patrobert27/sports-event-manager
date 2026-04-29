const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Competition',
  tableName: 'competitions',

  columns: {
      id: {
        primary: true,
        type: 'int',
        generated: true,
      },

      name: {
        type: 'varchar',
        length: 255,
        nullable: false,
      },

      date: {
        type: 'date',
        nullable: true,
      },

      start_time: {
        type: 'time',
        nullable: true,
      },

      status: {
        type: 'enum',
        enum: ['REGISTRATION', 'GROUP_STAGE', 'SEMIFINALS', 'FINAL_STAGE', 'FINISHED'],
        default: 'REGISTRATION',
      },

      registration_deadline: {
        type: 'timestamp',
        nullable: true,
      },

      available_courts: {
        type: 'int',
        nullable: false,
      },
  },

  relations: {
      activity: {
        type: 'many-to-one',
        target: 'Activity',
        joinColumn: { name: 'activity_id' },
        nullable: false,
      },

      field: {
        type: 'many-to-one',
        target: 'Field',
        joinColumn: { name: 'field_id' },
        nullable: false,
      },

      creator: {
        type: 'many-to-one',
        target: 'User',
        joinColumn: { name: 'creator_id' },
        nullable: false,
      },
  },
});
