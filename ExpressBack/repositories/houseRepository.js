const connection = require('../database');

function listHouses(userId, callback) {
    connection.query('SELECT * FROM house WHERE fk_caregiver = ?', [userId], (err, results) => {
        if (err) {
            console.error(`Error checking for house for elder with id ${userId}:`, err);
            callback('Error retrieving house list', null);
        } else {
            if (results.length > 0) {
                const houseList = results.map(result => {
                    return {
                        id: result.pk_id,
                        address: result.address,
                        zipcode: result.zip_code,
                    };
                });
                callback(null, houseList);
            } else {
                callback(null, []);
            }
        }
    });
}

function addHouse(userId, address, zipCode, callback) {
    try {
        const sql = 'INSERT INTO house (fk_caregiver, address, zip_code) VALUES (?, ?, ?)';
        const values = [userId, address, zipCode];
        connection.query(sql, values, (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                callback('Error executing SQL query', null);
            } else {
                const newRecord = {
                    id: results.insertId,
                    userId: userId,
                    address: address,
                    zipcode: zipCode,
                };
                callback(null, newRecord);
            }
        });
    } catch (err) {
        console.error('Error inserting record:', err);
        callback('Error inserting record', null);
    }
}

function showHouse(userId, address, callback) {
    connection.query('SELECT * FROM house WHERE fk_caregiver = ? AND address = ?', [userId, address], (err, results) => {
        if (err) {
            console.error(err);
            callback('Database query error', null);
        } else {
            if (results.length > 0 && results[0].plan !== null) {
                const data = JSON.parse(results[0].plan);
                const grid = data.pop();
                const rooms = data;
                callback(null, { rooms: rooms, housePlan: grid });
            } else {
                callback('House plan not found', null);
            }
        }
    });
}

module.exports = {
    listHouses,
    addHouse,
    showHouse,
};