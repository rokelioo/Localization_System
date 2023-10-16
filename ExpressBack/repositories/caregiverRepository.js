const connection = require('../database');

function getCaregiverById(userId, callback) {
    connection.query('SELECT * FROM caregiver WHERE pk_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking for user data:', err);
            callback('Error checking for user', null);
        } else {
            if (results.length > 0) {
                const data = {
                    name: results[0].name,
                    sirname: results[0].sirname,
                    email: results[0].email,
                    phone: results[0].phone,
                };
                callback(null, data);
            } else {
                callback('User not found', null);
            }
        }
    });
}

function updateCaregiver(userId, name, surname, newPassword, email, phoneNumber, oldPassword, callback) {
    connection.query('SELECT * FROM caregiver WHERE pk_id = ?', [userId], (error, rows) => {
        if (error) {
            console.error(error);
            callback('An error occurred while retrieving the caregiver', null);
            return;
        }

        const caregiver = rows[0];

        if (!caregiver) {
            callback('Caregiver not found', null);
            return;
        }

        if (oldPassword && oldPassword !== caregiver.password) {
            callback('Incorrect old password', null);
            return;
        }

        newPassword = newPassword || caregiver.password;
        connection.query(
            'UPDATE caregiver SET name = ?, sirname = ?, password = ?, email = ?, phone = ? WHERE pk_id = ?',
            [name, surname, newPassword, email, phoneNumber, userId],
            (error) => {
                if (error) {
                    console.error(error);
                    callback('An error occurred while updating the caregiver settings', null);
                } else {
                    callback(null, 'Caregiver settings updated successfully');
                }
            }
        );
    });
}

module.exports = {
    getCaregiverById,
    updateCaregiver,
};