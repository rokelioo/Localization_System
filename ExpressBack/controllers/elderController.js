const connection = require('../database');

exports.deleteElder = (req, res) => {
    let userId = req.body.id;
    var sql = '';
    sql = 'UPDATE elder SET hidden = true, remove_date = NOW() WHERE pk_id = ?'
  
    connection.query(sql, [userId], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).send('Error executing SQL query');
        return;
      }
      else{
        res.status(201).json(results);
      }
    });
}

exports.addElder = (req, res) => {
    let userId = req.params.userId;
    let locationId = req.body.locationId;
    let name = req.body.name;
    let surname = req.body.surname;
    let pendantUUID = req.body.pendantUUID;
    console.log(req.body);
    
    try {
  
      if (!locationId || !userId || !name || !surname || !pendantUUID) {
        res.status(400).send('Missing required input');
        return;
      }
    
  
      const sql = 'INSERT INTO elder (fk_house, fk_caregiver, name, sirname, pendant_uuid) VALUES (?, ?, ?, ?, ?)';
      const values = [locationId, userId, name, surname, pendantUUID];
      connection.query(sql, values, (err, results) => {
        if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).send('Error executing SQL query');
          return;
        }
  
        const newRecord = {
          id: results.insertId,
          locationId: locationId,
          userId: userId,
          name: name,
          surname: surname,
          pendantUUID: pendantUUID
        };
        res.status(201).json({ success: true, message: 'Record inserted successfully', record: newRecord });
  
      });
    } catch (err) {
      console.error('Error inserting record:', err);
      res.status(500).send('Error inserting record');
    }
    
}

exports.configureElder = (req, res) => {
    let userId = req.params.userId;
    let elderId = req.body.elderId;
    let name = req.body.name;
    let surname = req.body.surname;
    let uuid = req.body.uuid;
    let location = req.body.location;
    let houseId = req.body.houseId;
  
    if (houseId) {
      const query = `UPDATE elder SET fk_house = ?, fk_caregiver = ?, name = ?,
      sirname = ?, pendant_uuid = ?WHERE pk_id = ?`;
  
      console.log("location changed");
      const values = [houseId, userId, name, surname, uuid, elderId];
  
      connection.query(query, values, (error, results) => {
        if (error) {
          console.error('Error updating elder data:', error);
          res.status(500).send('Failed to update elder data.');
        } else {
          res.status(200).send('Elder data updated successfully.');
        }
      });
    } else {
      const query = `
        UPDATE elder SET fk_caregiver = ?, name = ?, sirname = ?, pendant_uuid = ?WHERE pk_id = ?`;
  
      const values = [userId, name, surname, uuid, elderId];
      console.log("location not changed");
      connection.query(query, values, (error, results) => {
        if (error) {
          console.error('Error updating elder data:', error);
          res.status(500).send('Failed to update elder data.');
        } else {
          res.status(200).send('Elder data updated successfully without houseId.');
        }
      });
    }
}

exports.list = (req, res) => {
    const userId = req.params.userId;

    console.log(userId);

    connection.query('SELECT * FROM elder WHERE fk_caregiver = ?', [userId], (err, results) => {
    if (err) {
        console.error('Error checking for user:', err);
        res.status(500).send('Error checking for user');
        return;
    }

    if (results.length > 0) {
        let elders = [];

        elders = results.map(result => {
        const elderId = result["pk_id"];
        const elderHouseId = result["fk_house"];
        const elderUUID = result["pendant_uuid"];
        const elderDeleted = result["hidden"]

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
                "hidden" : elderDeleted
                });
            }
            });
        });
        });

        Promise.all(elders)
        .then(elderResults => {
            console.log(elderResults); 
            res.send(elderResults); 
        })
        .catch(error => {
            console.error('Error checking for houses for elders:', error);
            res.status(500).send('Error checking for houses for elders');
        });
    } else {
        const data = { success: "BAD"};
        res.send(data);
    }
    });
}
