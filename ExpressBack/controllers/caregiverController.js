const connection = require('../database');

exports.caregiverSettings = (req, res) => {
    const userId = req.params.userId;
    var data;
    connection.query('SELECT * FROM caregiver WHERE pk_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error checking for user data:', err);
        res.status(500).send('Error checking for user');
        return;
      }
      if(results.length > 0)
      {
        data = {
          name: results[0].name,
          sirname: results[0].sirname,
          email: results[0].email,
          phone: results[0].phone
        }
        res.send(data);
         console.log(data);
  
      }
      else
      {
        console.error('User not found');
      }
    });
}

exports.caregiverChange = async (req, res) => {
    let userId = req.params.userId;
    let name = req.body.name;
    let surname = req.body.surname;
    let phoneNumber = req.body.phoneNumber;
    let email = req.body.email;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    console.log(oldPassword);
    console.log(newPassword);
  
    connection.query('SELECT * FROM caregiver WHERE pk_id = ?', [userId], (error, rows) => {
      if (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the caregiver' });
        return;
      }
  
      const caregiver = rows[0];
      console.log(caregiver);
  
      if (!caregiver) {
        res.status(404).json({ message: 'Caregiver not found' });
        return;
      }
  
      if (oldPassword && oldPassword !== caregiver.password) {
        res.status(401).json({ message: 'Incorrect old password' });
        return;
      }
  
      newPassword = newPassword || caregiver.password;
      connection.query(
        'UPDATE caregiver SET name = ?, sirname = ?, password = ?, email = ?, phone = ? WHERE pk_id = ?',
        [name, surname, newPassword, email, phoneNumber, userId],
        (error) => {
          if (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred while updating the caregiver settings' });
            return;
          }
  
          res.status(200).json({ success: true, message: 'Caregiver settings updated successfully' });
        }
      );
    });
}