const users = [
    {
        username: "bobo",
        firstname: "John",
        lastname: "Smith",
        email: "play@mail.ru",
        password: "123456",
        isMember: false,
        isAdmin: false,
    },
];

function addUser(userData) {
    let { username, firstname, lastname, email, password } = userData;
    let user = {
        username,
        firstname,
        lastname,
        email,
        password,
        isMember: false,
        isAdmin: false,
    };
    users.push(user);
}

module.exports = {
    users,
    addUser,
};
