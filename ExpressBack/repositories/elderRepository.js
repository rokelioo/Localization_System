const connection = require('../database');

function deleteElder(userId, callback) {
    const sql = 'UPDATE elder SET hidden = true, remove_date = NOW() WHERE pk_id = ?';
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            callback('Error executing SQL query', null);
        } else {
            callback(null, results);
        }
    });
}

function addElder(userId, locationId, name, surname, pendantUUID, callback) {
    if (!locationId || !userId || !name || !surname || !pendantUUID) {
        callback('Missing required input', null);
        return;
    }

    const sql = 'INSERT INTO elder (fk_house, fk_caregiver, name, sirname, pendant_uuid) VALUES (?, ?, ?, ?, ?)';
    const values = [locationId, userId, name, surname, pendantUUID];
    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            callback('Error executing SQL query', null);
        } else {
            const newRecord = {
                id: results.insertId,
                locationId: locationId,
                userId: userId,
                name: name,
                surname: surname,
                pendantUUID: pendantUUID
            };
            callback(null, newRecord);
        }
    });
}

function configureElder(userId, elderId, name, surname, uuid, location, houseId, callback) {
    let query;
    let values;

    if (houseId) {
        query = `UPDATE elder SET fk_house = ?, fk_caregiver = ?, name = ?, sirname = ?, pendant_uuid = ? WHERE pk_id = ?`;
        values = [houseId, userId, name, surname, uuid, elderId];
    } else {
        query = `UPDATE elder SET fk_caregiver = ?, name = ?, sirname = ?, pendant_uuid = ? WHERE pk_id = ?`;
        values = [userId, name, surname, uuid, elderId];
    }

    connection.query(query, values, (error, results) => {
        if (error) {
            console.error('Error updating elder data:', error);
            callback('Failed to update elder data', null);
        } else {
            callback(null, 'Elder data updated successfully');
        }
    });
}

function listElders(userId, callback) {
    connection.query('SELECT * FROM elder WHERE fk_caregiver = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error checking for user:', err);
            callback('Error checking for user', null);
        } else {
            if (results.length > 0) {
                const elders = results.map(result => {
                    const elderId = result["pk_id"];
                    const elderHouseId = result["fk_house"];
                    const elderUUID = result["pendant_uuid"];
                    const elderDeleted = result["hidden"];
                    return new Promise((resolve, reject) => {
                        connection.query('SELECT * FROM house WHERE pk_id = ?', [elderHouseId], (err, houseResult) => {
                            if (err) {
                                console.error(`Error checking for house for elder with id ${elderId}:`, err);
                                reject(err);
                            } else {
                                const address = houseResult.length > 0 ? houseResult[0]["address"] : "";
                                resolve({
                                    "id": elderId,
                                    "name": result["name"],
                                    "sirname": result["sirname"],
                                    "address": address,
                                    "uuid": elderUUID,
                                    "hidden": elderDeleted
                                });
                            }
                        });
                    });
                });

                Promise.all(elders)
                    .then(elderResults => {
                        callback(null, elderResults);
                    })
                    .catch(error => {
                        console.error('Error checking for houses for elders:', error);
                        callback('Error checking for houses for elders', null);
                    });
            } else {
                const data = { success: "BAD" };
                callback(null, data);
            }
        }
    });
}

module.exports = {
    deleteElder,
    addElder,
    configureElder,
    listElders,
};