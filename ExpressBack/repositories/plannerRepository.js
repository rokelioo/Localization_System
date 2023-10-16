const connection = require('../database');

function listHousesWithoutPlan(userId, callback) {
    try {
        connection.query('SELECT * FROM house WHERE fk_caregiver = ? AND plan IS NULL', [userId], (err, results) => {
            if (err) {
                console.error(`Error checking for houses without plans for user with id ${userId}:`, err);
                callback('Error retrieving houses without plans', null);
            } else {
                if (results.length > 0) {
                    const data = results.map(result => {
                        return {
                            pk_id: result.pk_id,
                            address: result.address
                        };
                    });
                    callback(null, data);
                } else {
                    callback(null, []);
                }
            }
        });
    } catch (err) {
        console.error('Error searching for houses without plans:', err);
        callback('Error searching for houses without plans', null);
    }
}

function updateHousePlan(housePkId, planData, callback) {
    const toTheDatabase = [];
    const fixBeforePut = [{}];
    let housePlanString;
    let insertRoomCount = 0;
    let roomResultsArray = [];

    for (let i = 0; i < planData.length; i++) {
        if (i != planData.length - 1) {
            toTheDatabase[i] = planData[i];
        } else {
            fixBeforePut[0] = {
                roomId: planData[i].roomId,
                roomColor: planData[i].roomColor,
                roomName: planData[i].roomName,
            };
            fixBeforePut[1] = { grid: planData[i].grid };
            housePlanString = JSON.stringify(fixBeforePut);
            toTheDatabase[i] = fixBeforePut[0];
            toTheDatabase[i + 1] = fixBeforePut[1];
        }
    }

    const insertRoom = (room, houseId, callback) => {
        const sql = 'INSERT INTO room (fk_house, name) VALUES (?, ?)';
        const values = [houseId, room.roomName];
        connection.query(sql, values, (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return callback(err);
            }
            callback(null, results);
        });
    };

    const insertRooms = (rooms, houseId, callback) => {
        let count = 0;
        roomResultsArray = [];
        const errorCallback = (err) => {
            if (err) {
                callback(err);
            } else {
                count++;
                if (count === rooms.length) {
                    callback(null, roomResultsArray);
                }
            }
        };
        rooms.forEach((room) => {
            insertRoom(room, houseId, (err, results) => {
                if (err) {
                    errorCallback(err);
                } else {
                    roomResultsArray.push(results);
                    errorCallback();
                }
            });
        });
    };

    const stringified = JSON.stringify(toTheDatabase);
    const sql = 'UPDATE house SET plan = ? WHERE pk_id = ?';
    const values = [stringified, housePkId];
    connection.query(sql, values, (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            callback('Error executing SQL query', null);
            return;
        }

        const newRecord = {
            id: housePkId,
            plan: stringified,
        };
        insertRooms(toTheDatabase.slice(0, -1), housePkId, (err, roomResults) => {
            if (err) {
                console.error('Error inserting rooms:', err);
                callback('Error inserting rooms', null);
                return;
            }

            callback(null, newRecord);
        });
    });
}

module.exports = {
    listHousesWithoutPlan,
    updateHousePlan,
};