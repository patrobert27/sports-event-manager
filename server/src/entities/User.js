const { EntitySchema } = require('typeorm');

const User = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        first_name: { 
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        last_name: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        email: {
            type: 'varchar',
            length: 255,
            nullable: false,
            unique: true,
        },
        password: {
            type: 'varchar',
            length: 255,
            nullable: false,
        },
        photo: {
            type: 'varchar',
            length: 255,
            nullable: true,
        },
        // role_id: {
        //   type: 'int',
        //   nullable: false,
        // },
        created_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
        },
    },


    // reelationships
    relations: {
      role: {
        type: 'many-to-one',
        target: 'Role',
        joinColumn: { name: 'role_id' },
        nullable: false,
      },
    },
});

module.exports = User;
