const { Pool } = require("pg");

const pool = new Pool({
    host: "localhost", // or wherever the db is hosted
    user: process.env.USER,
    database: "clubhouse_db",
    password: process.env.PASSWORD,
    port: 5432, // The default port
});

// const pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     // ssl: {
//     //     rejectUnauthorized: false,
//     // },
// });

pool.connect((err) => {
    if (err) throw err;
    console.log("Connect to PostgreSQL successfully!");
});

module.exports = pool;
