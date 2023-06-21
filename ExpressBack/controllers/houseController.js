const connection = require('../database');

exports.list = (req, res) => {
    const userId = req.params.userId;
    connection.query('SELECT * FROM house WHERE fk_caregiver = ?', [userId], (err, results) => {
      if (err) {
        console.error(`Error checking for house for elder with id ${userId}:`, err);
        res.status(500).send('Error retrieving house list');
      } else {
        if (results.length > 0) {
          res.write('[');
          results.forEach((result, i) => {
            if (i > 0) res.write(',');
            res.write(JSON.stringify({ 
              id: result.pk_id,
              address: result.address }));
          });
          res.write(']');
        } else {
          res.send([]);
        }
        res.end();
      }
    });
}

exports.addHouse = (req, res) => {
    let userId = req.params.userId;
    let address = req.body.address;
    let zipCode = req.body.zipcode;
    console.log(req.body);
    
    try {
  
      const sql = 'INSERT INTO house (fk_caregiver, address, zip_code) VALUES (?, ?, ?)';
      const values = [userId, address, zipCode];
      connection.query(sql, values, (err, results) => {
        if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).send('Error executing SQL query');
          return;
        }
  
        const newRecord = {
          id: results.insertId,
          userId: userId,
          address: address,
          zipcode: zipCode,
        };
        res.status(201).json({ success: true, message: 'Record inserted successfully', record: newRecord });
  
      });
    } catch (err) {
      console.error('Error inserting record:', err);
      res.status(500).send('Error inserting record');
    }
}

exports.showHouse = (req, res) => {
    const { name, sirname, address, userId } = req.query;
  
    connection.query('SELECT * FROM house WHERE fk_caregiver = ? AND address = ?', [userId, address], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query error' });
      } else {
        if (results.length > 0 && results[0].plan !== null) {
          const data = JSON.parse(results[0].plan);
          const grid = data.pop(); 
          const rooms = data; 
          console.log(grid);
  
          res.json({ rooms:rooms, housePlan: grid });
        } else {
          res.status(404).json({ error: 'House plan not found' });
        }
      }
    });
}