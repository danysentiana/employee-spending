import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db2 = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST2,
        user: process.env.DB_USER2,
        password: process.env.DB_PASS2,
        database: process.env.DB_NAME2,
        port: process.env.DB_PORT2,
    },
    pool: { min: 0, max: 20 },
});

export default db2;
