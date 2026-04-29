const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Field',
  tableName: 'fields',

  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },

        name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },

        location: {
            type: 'varchar',
            length: 255,
            nullable: true,
        },

        number_of_courts: {
            type: 'int',
            nullable: true,
        },
  },
});
