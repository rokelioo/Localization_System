const connection = require('../database');

exports.list = (req, res) => {
    const userId = req.params.userId;
    try{
      connection.query('SELECT * FROM house WHERE fk_caregiver = ? AND plan IS NULL', [userId],  (err, results) => {
        if(err){
          console.error(`Error checking for house for elder with id ${userId}:`, err);
          res.status(500).send('Error retrieving house list');
        }
        else{
          if (results.length > 0) {
              const data = [];
              results.forEach((result, index) => {
                data[index] = {
                  pk_id: result.pk_id,
                  address: result.address
                }
              })
              res.send(data);
              console.log(data);
          }
          else{
            const data = [];
            res.send(data);
            console.error('No houses without plans');
  
          }
        }
      })
    }
    catch{
      console.error('Error searching forhouses:', err);
      res.status(500).send('Error searching forhouses')
    }
}

exports.housePlan = (req, res) => {
    let userId = req.params.userId;
    const planReq = req.body.roomInfromation;
    const toTheDatabase = [];
    const fixBeforePut = [{}];
    var housePkId;
  
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
  
    for(let i = 0; i < planReq.length; i++)
    {
      if(i!=planReq.length-1)
      {
        console.log(planReq[i])
        toTheDatabase[i] = planReq[i];
      }
      else{
  
        fixBeforePut[0] = {
          roomId: planReq[i].roomId,
          roomColor: planReq[i].roomColor,
          roomName: planReq[i].roomName,
        }
        console.log(fixBeforePut[0])
        fixBeforePut[1] = { grid: planReq[i].grid}
        housePkId = planReq[i].pkIdHouse;
        toTheDatabase[i] = fixBeforePut[0];
        toTheDatabase[i+1] = fixBeforePut[1];
      }
    } 
  
    const insertRooms = (rooms, houseId, callback) => {
      let count = 0;
      const resultsArray = [];
      const errorCallback = (err) => {
        if (err) {
          callback(err);
        } else {
          count++;
          if (count === rooms.length) {
            callback(null, resultsArray);
          }
        }
      };
      rooms.forEach((room) => {
        insertRoom(room, houseId, (err, results) => {
          if (err) {
            errorCallback(err);
          } else {
            resultsArray.push(results);
            errorCallback();
          }
        });
      });
    };
  
    console.log(housePkId);
    console.log(toTheDatabase);
    const stringified = JSON.stringify(toTheDatabase);
    const sql = 'UPDATE house SET plan = ? WHERE pk_id = ?';
      const values = [stringified, housePkId];
      connection.query(sql, values, (err, results) => {
        if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).send('Error executing SQL query');
          return;
        }
  
        const newRecord = {
          id: results.housePkId,
          plan: stringified,
        };
        insertRooms(toTheDatabase.slice(0, -1), housePkId, (err, roomResults) => {
          if (err) {
            console.error('Error inserting rooms:', err);
            res.status(500).send('Error inserting rooms');
            return;
          }
    
          res.status(201).json({ success: true, message: 'Record inserted successfully', record: newRecord });
        });
      });
}