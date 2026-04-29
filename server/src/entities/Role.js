const { EntitySchema } = require('typeorm');

const Role = new EntitySchema({
  name: 'Role',
  tableName: 'roles',
  columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true,
        },
        name: {
            type: 'varchar',
            length: 50,
            nullable: false,
            unique: true,
        },
        created_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP',
            },
    },

    relations: {
        users: {
            type: 'one-to-many',
            target: 'User',
            inverseSide: 'role',
        },
    }
});

module.exports = Role;
    