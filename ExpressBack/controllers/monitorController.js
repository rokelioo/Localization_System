const connection = require('../database');

exports.location = (req, res) => {
    const elderId = req.params.elderId;
  
    const sql = 'SELECT * FROM location WHERE fk_elder =?';

    connection.query(sql, [elderId], (error, results) => {
      if (error) {
        console.error(`Error checking for location for elder with id ${elderId}:`, error);
        res.status(500).send('Error retrieving house list');
      } 
      else{
        if(results.length > 0)
        {
          let lastRoom = results[results.length-1].fk_room;
          sql2 = 'SELECT * FROM room WHERE pk_id =?';

          connection.query(sql2, [lastRoom], (error2, results2) => {
            if (error2) {
              console.error(`Error checking for room with id ${lastRoom}:`, error2);
              res.status(500).send('Error retrieving house list');
            } 
            else{
              if(results2.length > 0){
                let currentRoom = results2[0].name;
                res.send({"location" : currentRoom, "elderid" : elderId});
              }
              else{
                res.send({"location" : "Not found", "elderid" : elderId});
              }
            }
          });
        }
        else{
          res.send({"location" : "Not found", "elderid" : elderId});
        }
      }
    });

}
