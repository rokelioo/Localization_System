const connection = require('../database');

function getEmergencyStatisticsByElderId(elderId, callback) {
    const sql = 'SELECT * FROM emergency WHERE fk_elder = ?';

    connection.query(sql, [elderId], (error, results) => {
        if (error) {
            console.error(`Error checking for emergency data for elder with id ${elderId}:`, error);
            callback('Error retrieving emergency data', null);
        } else {
            if (results.length > 0) {
                const emergencyCounts = {};

                results.forEach((emergency) => {
                    const date = new Date(emergency.emergency_date).toISOString().split('T')[0];

                    if (emergencyCounts[date]) {
                        emergencyCounts[date]++;
                    } else {
                        emergencyCounts[date] = 1;
                    }
                });

                const mergedEmergencies = Object.entries(emergencyCounts).map(([emergencyDate, emergencyCount]) => ({
                    emergencyDate,
                    emergencyCount,
                }));

                callback(null, mergedEmergencies);
            } else {
                callback(null, []);
            }
        }
    });
}

function getTimeSpentByElderId(elderId, callback) {
    const sql = 'SELECT * FROM location WHERE fk_elder = ?';

    connection.query(sql, [elderId], async (error, results) => {
        if (error) {
            console.error(`Error checking for location data for elder with id ${elderId}:`, error);
            callback('Error retrieving location data', null);
        } else {
            if (results.length > 0) {
                const roomTimeSpent = {};

                for (const result of results) {
                    const { fk_room, enter_time, exit_time } = result;

                    if (exit_time !== null) {
                        const timeSpent = new Date(exit_time) - new Date(enter_time);
                        const date = new Date(enter_time).toISOString().split('T')[0];

                        const sql2 = 'SELECT * FROM room WHERE pk_id = ?';
                        const [room] = await new Promise((resolve, reject) => {
                            connection.query(sql2, [fk_room], (err, res) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(res);
                                }
                            });
                        });

                        const room_name = room.name;

                        if (!roomTimeSpent[date]) {
                            roomTimeSpent[date] = {};
                        }

                        if (!roomTimeSpent[date][room_name]) {
                            roomTimeSpent[date][room_name] = timeSpent;
                        } else {
                            roomTimeSpent[date][room_name] += timeSpent;
                        }
                    }
                }

                const timeSpentArray = Object.entries(roomTimeSpent).flatMap(([date, rooms]) => {
                    return Object.entries(rooms).map(([room_name, timeSpent]) => ({
                        date,
                        room_name,
                        timeSpent,
                    }));
                });

                callback(null, timeSpentArray);
            } else {
                callback(null, []);
            }
        }
    });
}

function getRoomChangeStatisticsByElderId(elderId, callback) {
    const sql = 'SELECT * FROM location WHERE fk_elder = ? ORDER BY enter_time ASC';

    connection.query(sql, [elderId], (error, results) => {
        if (error) {
            console.error(`Error checking for location data for elder with id ${elderId}:`, error);
            callback('Error retrieving location data', null);
        } else {
            if (results.length > 0) {
                const roomChangesPerDay = {};

                for (let i = 0; i < results.length - 1; i++) {
                    const { enter_time: enterTime1, exit_time: exitTime1 } = results[i];
                    const { enter_time: enterTime2 } = results[i + 1];

                    if (exitTime1 !== null) {
                        const date1 = new Date(exitTime1).toISOString().split('T')[0];
                        const date2 = new Date(enterTime2).toISOString().split('T')[0];

                        if (date1 === date2) {
                            if (!roomChangesPerDay[date1]) {
                                roomChangesPerDay[date1] = 1;
                            } else {
                                roomChangesPerDay[date1]++;
                            }
                        }
                    }
                }

                const roomChangesArray = Object.entries(roomChangesPerDay).map(([date, roomChanges]) => ({
                    date,
                    roomChanges,
                }));

                callback(null, roomChangesArray);
            } else {
                callback(null, []);
            }
        }
    });
}

module.exports = {
    getEmergencyStatisticsByElderId,
    getTimeSpentByElderId,
    getRoomChangeStatisticsByElderId,
};