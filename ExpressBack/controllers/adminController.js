const connection = require('../database');

exports.userList = (req, res) => {
    connection.query('SELECT * FROM caregiver', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query error' });
        } 
        else{
            if (results.length > 0) {
            const data = [];
            results.forEach((result, index) => {
                data[index] = {
                pk_id: result.pk_id,
                name: result.name,
                surname: result.sirname,
                email: result.email,
                phone: result.phone,
                login: result.last_login,
                admin: result.admin,
                block: result.block
            }});
            res.send(data);
            console.log(data);
            }
            else{
            console.error('There are no users');
            }
        }
    });
}

exports.configureUser = (req, res) => {
    const { id } = req.params;
    try{
      connection.query('SELECT * FROM caregiver WHERE pk_id = ? ', [id],  (err, results) => {
        if(err){
          console.error(`Error checking for caregiver ${id}:`, err);
          res.status(500).send('Error retrieving caregiver');
        }
        else{
          if (results.length > 0) {
            const person = {
              id: id,
              name: results[0].name,
              surname: results[0].sirname,
              password: results[0].password,
              email: results[0].email,
              phone: results[0].phone,
            };
              res.send(person);
              console.log(person);
          }
          else{
            const person = [];
            res.send(person);
            console.error('No caregiver with given id');
  
          }
        }
      });
    }
    catch{
      console.error('Error searching forhouses:', err);
      res.status(500).send('Error searching forhouses')
    }
}

exports.blockUser = (req, res) => {
    let userId = req.body.pk_id;
    var sql = '';
    if(req.body.block)
    {
      sql = 'UPDATE caregiver SET block = false WHERE pk_id = ?';
    }
    else
    {
      sql = 'UPDATE caregiver SET block = true WHERE pk_id = ?';
    }
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

exports.sumbitChanges = (req, res) => {
    let userId = req.params.id;
    let name = req.body.name;
    let surname = req.body.surname;
    let password = req.body.password;
    let email = req.body.email;
    let phone = req.body.phone;
    let sql = `UPDATE caregiver SET name = ?, sirname = ?, password = ?, email = ?, phone = ? WHERE pk_id = ?`;
  
    connection.query(sql, [name, surname, password, email, phone , userId], (error, results) => {
      if (error) {
        console.error('Error updating elder data:', error);
        res.status(500).send('Failed to update elder data.');
      } else {
        res.status(200).send('Elder data updated successfully.');
      }
    });
}

exports.configureUsersPlan = (req, res) => {
    let userId = req.params.userId;
    let houseId = req.params.houseId;
    let sentData = req.body;
    let sql = `UPDATE house SET plan = ? WHERE pk_id = ?`;
  
    connection.query(sql, [JSON.stringify(sentData), houseId], (error, results, fields) => {
      if (error) {
        return console.error(error.message);
      }
      console.log('Rows affected:', results.affectedRows);
    });
}
