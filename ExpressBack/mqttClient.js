const mqtt = require('mqtt');
const nodemailer = require('nodemailer');
const connection = require('./database');

var options = {
  username: 'elder',
  password: 'elder123',
}
const client  = mqtt.connect('mqtt://3.122.59.75:1883', options);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const mailOptions = {
    from: 'eldermessage@zohomail.eu',
    to: 'rokaslideikis5@gmail.com',
    subject: 'Test email',
    text: 'This is a test email from Nodemailer'
  };


  function sendEmail(caregiverEmail, elder){
    return new Promise((resolve, reject) => {
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.zoho.eu',
            port: 465,
            secure: true,
            auth: {
              user: 'eldermessage@zohomail.eu',
              pass: 'Slaptazodis123!'
            }
        })
        const mailOptions = {
            from: 'eldermessage@zohomail.eu',
            to: caregiverEmail,
            subject: 'EMERGENCY!!!',
            text: 'The '+elder+' is in danger'
            }
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.error(error);
                  return reject ({message:'error occured'})
                } else {
                  console.log('Email sent: ' + info.response);
                  return resolve ({message:'email sent'})
                }
            })
        })
    }
    
client.on('message', function (topic, message) {
    console.log(topic + ': ' + message.toString());
    if (topic === 'elder/emergency/topic') {
        const messagePart = message.toString().split('+');
        const uuid = messagePart[0];
        const emergencyLocation = messagePart[1];

        const sql = 'SELECT * FROM elder WHERE pendant_uuid = ?';
        connection.query(sql, [uuid], (err, results) => {
        if (err) {
            console.error('Error finding elder:', err);
            return;
        }

        if (results.length > 0) {
            const elderId = results[0].pk_id;
            const sql = `INSERT INTO emergency (fk_elder, emergency_date, emergency_location) VALUES (?, NOW(), ?)`;
            connection.query(sql, [elderId, emergencyLocation], (err, result) => {
            if (err) {
                console.error('Error inserting emergency:', err);
                return;
            }

            console.log('Inserted emergency successfully:', result.insertId);
            });

            const sql2 = 'SELECT email FROM caregiver WHERE pk_id = ?';
            const caregiverId = results[0].fk_caregiver;;
            connection.query(sql2, [caregiverId], (error, careresult) => {
                if (error) {
                    console.error('Error inserting emergency:', error);
                    return;
                }
                if(careresult.length > 0)
                {
                    sendEmail(careresult[0].email, results[0].name);
                }
                else{
                    console.error('No caregiver found with the given pk_id:', caregiverId);
        
                }
            });
        } else {
            console.error('No elder found with the given uuid:', uuid);
        }
        });


    }
    else if(topic === 'elder/location/topic')
    {
      let messagePart = message.toString().split('+');
            let uuid = messagePart[0];
            let boardId = messagePart[1];

            const sql = 'SELECT * FROM elder WHERE pendant_uuid =?';
            connection.query(sql, [uuid], (error, result) => {
              if(error)
              {
                console.error('Error searching for elder:', error);
                return;
              }
              if(result.length > 0)
              {
                let elderId = result[0].pk_id;
                let houseId = result[0].fk_house;
                const sql2 = 'SELECT * FROM house WHERE pk_id =?';
                connection.query(sql2, [houseId], (error2, result2) => {
                  if(error2)
                  {
                    console.error('Error searching for house:', error2);
                  }
                  if(result2.length > 0)
                  {
                    let housePlan = JSON.parse(result2[0].plan);
                    for(let i = 0; i < housePlan.length-1; i++)
                    {
                      if(housePlan[i].roomId == boardId)
                      {
                        let roomName = housePlan[i].roomName;
                        const sql3 = 'SELECT pk_id FROM room WHERE fk_house =? AND name =?';
                        connection.query(sql3, [houseId, roomName], (error3, result3) => {
                          if(error3)
                          {
                            console.error('Error searching for room:', error3);
                          }
                          if (result3.length > 0) {
                            let roomId = result3[0].pk_id;
          

                            const sql5 = 'SELECT * FROM location WHERE fk_elder = ? ORDER BY enter_time DESC LIMIT 1';
                            connection.query(sql5, [elderId], (error5, result5) => {
                              if (error5) {
                                console.error('Error finding last location:', error5);
                              }
          

                              if (result5.length > 0) {
                                const sql6 = 'UPDATE location SET exit_time = NOW() WHERE pk_id = ?';
                                connection.query(sql6, [result5[0].pk_id], (error6, result6) => {
                                  if (error6) {
                                    console.error('Error updating exit_time:', error6);
                                  }
                                });
                              }
          

                              const sql4 = 'INSERT INTO location (fk_elder, fk_room, enter_time) VALUES (?, ?, NOW())';
                              connection.query(sql4, [elderId, roomId], (error4, result4) => {
                                if (error4) {
                                  console.error('Error inserting location:', error4);
                                } else {
                                  console.log('Inserted location successfully:', result4);
                                }
                              });
                            });
                          } else {
                            console.error('No room found with the given name:', roomName);
                          }
                        });
                      }
                    }
                  } else {
                    console.error('No house found with the given houseid:', houseId);
                  }
                });
              } else {
                console.error('No elder found with the given pendant_uuid:', uuid);
              }
            });
      }
    client.publish('test/patikra', 'Hello, world!');
  });

  client.on('connect', function () {
    console.log('MQTT client connected');
    client.subscribe('elder/emergency/topic');
    client.subscribe('elder/location/topic');
  });
  client.on('error', function (error) {
    console.error('MQTT client error:', error);
  });

  module.exports = client;