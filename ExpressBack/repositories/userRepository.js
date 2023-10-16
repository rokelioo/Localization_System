const connection = require('../database');

function registerUser(name, surname, email, password, phone, callback) {
    connection.query('SELECT * FROM caregiver WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Error checking for user:', err);
            callback('Error checking for user', null);
        }

        if (results.length > 0) {
            console.log('User with the same email already exists');
            callback('User with the same email already exists', { success: "BAD" });
        } else {
            connection.query(
                'INSERT INTO caregiver (name, sirname, password, email, phone, last_login) VALUES (?, ?, ?, ?, ?, NOW())',
                [name, surname, password, email, phone],
                (err, results) => {
                    if (err) {
                        console.error('Error inserting new caregiver:', err);
                        callback('Error inserting new caregiver', null);
                    }

                    console.log('New caregiver inserted with ID:', results.insertId);
                    callback(null, { success: "OK", id: results.insertId });
                }
            );
        }
    });
}

function loginUser(name, pass, callback) {
    connection.query('SELECT * FROM caregiver WHERE email = ? AND password = ?', [name, pass], (err, results) => {
        if (err) {
            console.error('Error checking for user:', err);
            callback('Error checking for user', null);
        }

        if (results.length > 0) {
            console.log(results);
            if (results[0].block === 1) {
                callback('User is blocked', { success: "BLOCK" });
            } else {
                const data = {
                    success: "OK",
                    id: results[0]["pk_id"],
                    admin: results[0]["admin"],
                };

                connection.query('UPDATE caregiver SET last_login = NOW() WHERE email = ? AND password = ?', [name, pass], (err, results) => {
                    if (err) {
                        console.error('Error updating last_login:', err);
                    } else {
                        console.log('last_login updated successfully for user:', name);
                    }
                });

                callback(null, data);
            }
        } else {
            callback('User not found', { success: "BAD" });
        }
    });
}

module.exports = {
    registerUser,
    loginUser,
};