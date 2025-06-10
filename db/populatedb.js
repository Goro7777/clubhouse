#! /usr/bin/env node

const { Client } = require("pg");
/*
USER
username, firstname, lastname, email, password, isMember, isAdmin, joinedOn

MESSAGE
user_id, time, title, text
*/
let SQL = `
CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username TEXT,
    firstname TEXT,
    lastname TEXT,
    email TEXT,
    password TEXT,
    isMember BOOLEAN,
    isAdmin BOOLEAN,
    joinedOn TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    postId INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    text TEXT,
    postedOn TIMESTAMP,
    userId INTEGER REFERENCES users (userId)
);


`;

let name = process.argv[2];
let password = process.argv[3];

async function main() {
    console.log("seeding...");
    console.log(name, password);
    const client = new Client({
        connectionString: `postgresql://${name}:${password}@localhost:5432/clubhouse_db`,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main();
