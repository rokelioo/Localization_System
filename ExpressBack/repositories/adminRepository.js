const connection = require('../database');

function getUsers(callback) {
    connection.query('SELECT * FROM caregiver', (err, results) => {
        if (err) {
            console.error(err);
            callback('Database query error', null);
        } else {
            const data = results.map(result => ({
                pk_id: result.pk_id,
                name: result.name,
                surname: result.sirname,
                email: result.email,
                phone: result.phone,
                login: result.last_login,
                admin: result.admin,
                block: result.block
            }));
            callback(null, data);
        }
    });
}

function getUserById(id, callback) {
    connection.query('SELECT * FROM caregiver WHERE pk_id = ? ', [id], (err, results) => {
        if (err) {
            console.error(`Error checking for caregiver ${id}:`, err);
            callback('Error retrieving caregiver', null);
        } else {
            if (results.length > 0) {
                const person = {
                    id: id,
                    name: results[0].name,
                    surname: results[0].sirname,
                    password: results[0].password,
                    email: results[0].email,
                    phone: results[0].phone,
                };
                callback(null, person);
            } else {
                callback('No caregiver with given id', null);
            }
        }
    });
}

function blockUser(userId, block, callback) {
    const sql = block ? 'UPDATE caregiver SET block = false WHERE pk_id = ?' : 'UPDATE caregiver SET block = true WHERE pk_id = ?';
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            callback('Error executing SQL query', null);
        } else {
            callback(null, results);
        }
    });
}

function updateUser(userId, name, surname, password, email, phone, callback) {
    const sql = `UPDATE caregiver SET name = ?, sirname = ?, password = ?, email = ?, phone = ? WHERE pk_id = ?`;
    connection.query(sql, [name, surname, password, email, phone, userId], (error, results) => {
        if (error) {
            console.error('Error updating elder data:', error);
            callback('Failed to update elder data.', null);
        } else {
            callback(null, 'Elder data updated successfully.');
        }
    });
}

function configureUsersPlan(userId, houseId, sentData, callback) {
    const sql = `UPDATE house SET plan = ? WHERE pk_id = ?`;
    connection.query(sql, [JSON.stringify(sentData), houseId], (error, results, fields) => {
        if (error) {
            console.error(error.message);
            callback(error.message, null);
        } else {
            callback(null, `Rows affected: ${results.affectedRows}`);
        }
    });
}

module.exports = {
    getUsers,
    getUserById,
    blockUser,
    updateUser,
    configureUsersPlan,
};