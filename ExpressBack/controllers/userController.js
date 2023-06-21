const connection = require('../database');

exports.registerUser = (req, res) => {
    let name = req.body.name;
    let surname = req.body.surname;
    let email = req.body.email;
    let password = req.body.password;
    let phone = req.body.phoneNumber;
    console.log(req.body.name);
    
  
    connection.query('SELECT * FROM caregiver WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error checking for user:', err);
        res.status(500).send('Error checking for user');
        return;
      }
    
      if (results.length > 0) {
        console.log('User with the same email already exists');
        const data = { success: "BAD" };
        res.send(data);
      } else {
        connection.query(
          'INSERT INTO caregiver (name, sirname, password, email, phone, last_login) VALUES (?, ?, ?, ?, ?, NOW())',
          [name, surname, password, email, phone],
          (err, results) => {
            if (err) {
              console.error('Error inserting new caregiver:', err);
              res.status(500).send('Error inserting new caregiver');
              return;
            }
    
            console.log('New caregiver inserted with ID:', results.insertId);
            const data = { success: "OK", id: results.insertId };
            res.send(data);
          }
        );
      }
    });
}

exports.loginUser = (req, res) => {
    let name = req.body.name;
    let pass = req.body.pass;
  
    console.log(req.body.name);
  
    connection.query('SELECT * FROM caregiver WHERE email = ? AND password = ?', [name, pass], (err, results) => {
      if (err) {
        console.error('Error checking for user:', err);
        res.status(500).send('Error checking for user');
        return;
      }
  
      if (results.length > 0) {
        console.log(results);
        if(results[0].block === 1)
        {
          const data = { success: "BLOCK" };
          res.send(data);
        }
        else{
          const data = {
            success: "OK",
            id: results[0]["pk_id"],
            admin: results[0]["admin"],
          };
          res.send(data);
  
          
          connection.query('UPDATE caregiver SET last_login = NOW() WHERE email = ? AND password = ?', [name, pass], (err, results) => {
            if (err) {
              console.error('Error updating last_login:', err);
              return;
            }
            console.log('last_login updated successfully for user:', name);
          });
          
        }
      } else {
        const data = { success: "BAD" };
        res.send(data);
      }
    });
}