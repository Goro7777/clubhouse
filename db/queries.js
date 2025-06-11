const pool = require("./pool");
/*
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
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
*/

async function addUser(user) {
    await pool.query(
        `INSERT INTO users (username, firstname, lastname, email, password, isMember, isAdmin, joinedOn) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, to_timestamp($8))`,
        [
            user.username,
            user.firstname,
            user.lastname,
            user.email,
            user.hashedPassword,
            user.isMember,
            user.isAdmin,
            user.joinedOn / 1000,
        ]
    );
}

async function getAllUsers() {
    const { rows } = await pool.query(
        "SELECT * FROM users ORDER BY joinedOn DESC"
    );
    return rows;
}

async function getUserByField(fieldName, fieldValue) {
    const { rows } = await pool.query(
        `SELECT * FROM users WHERE ${fieldName} = '${fieldValue}'`
    );
    return rows[0];
}

async function getUserProfileInfo(userid) {
    const { rows } = await pool.query(
        `SELECT users.*, COUNT(posts.postid) AS postsCount 
        FROM users JOIN posts ON users.userid = posts.userid
        WHERE users.userid = ${userid}
        GROUP BY users.userid`
    );
    return rows[0];
}

async function addPost(post) {
    await pool.query(
        `INSERT INTO posts (title, text, postedOn, userId) 
                    VALUES ($1, $2, to_timestamp($3), $4)`,
        [post.title, post.text, post.postedOn / 1000, post.userId]
    );
}

async function getAllPosts() {
    const { rows } = await pool.query(
        "SELECT * FROM posts JOIN users ON posts.userId = users.userId ORDER BY postedOn DESC"
    );
    return rows;
}

async function getPost(postid) {
    const { rows } = await pool.query(
        `SELECT * FROM posts WHERE postid = ${postid}`
    );
    return rows[0];
}

async function deletePost(postid) {
    await pool.query(`DELETE FROM posts WHERE postid = ${postid}`);
}

async function editPost(post) {
    await pool.query(
        `UPDATE posts 
        SET title = $1, text = $2, postedOn = to_timestamp($3)
        WHERE postid = ${post.postid}`,
        [post.title, post.text, post.postedOn / 1000]
    );
}

//
async function getAllMessages() {
    const { rows } = await pool.query(
        "SELECT * FROM messages ORDER BY added DESC"
    );
    return rows;
}

async function getMessage(id) {
    const { rows } = await pool.query(
        `SELECT * FROM messages WHERE id = ${id}`
    );
    return rows[0];
}

async function addMessage(message) {
    await pool.query(
        "INSERT INTO messages (username, text, added) VALUES ($1, $2, to_timestamp($3))",
        [message.username, message.text, message.added / 1000]
    );
}

async function deleteMessage(id) {
    await pool.query(`DELETE FROM messages WHERE id = ${id}`);
}

async function editMessage(message) {
    await pool.query(
        `UPDATE messages 
        SET username = $1, text = $2, added = to_timestamp($3) 
        WHERE id = ${message.id}`,
        [message.username, message.text, message.added / 1000]
    );
}

module.exports = {
    addUser,
    getAllUsers,
    getUserByField,
    getUserProfileInfo,

    addPost,
    getAllPosts,
    getPost,
    deletePost,
    editPost,
};
