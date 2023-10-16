const connection = require('../database');

function getLocationByElderId(elderId, callback) {
    const sql = 'SELECT * FROM location WHERE fk_elder = ?';

    connection.query(sql, [elderId], (error, results) => {
        if (error) {
            console.error(`Error checking for location for elder with id ${elderId}:`, error);
            callback('Error retrieving location', null);
        } else {
            if (results.length > 0) {
                const lastRoom = results[results.length - 1].fk_room;
                const sql2 = 'SELECT * FROM room WHERE pk_id = ?';

                connection.query(sql2, [lastRoom], (error2, results2) => {
                    if (error2) {
                        console.error(`Error checking for room with id ${lastRoom}:`, error2);
                        callback('Error retrieving room', null);
                    } else {
                        if (results2.length > 0) {
                            const currentRoom = results2[0].name;
                            callback(null, { location: currentRoom, elderid: elderId });
                        } else {
                            callback(null, { location: 'Not found', elderid: elderId });
                        }
                    }
                });
            } else {
                callback(null, { location: 'Not found', elderid: elderId });
            }
        }
    });
}

module.exports = {
    getLocationByElderId,
};