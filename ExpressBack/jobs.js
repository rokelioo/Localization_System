const schedule = require('node-schedule');
const connection = require('./database');

let dailyJob = schedule.scheduleJob({hour: 18, minute: 56, tz: 'Europe/Vilnius'}, function(){
  let today = new Date();
  today.setDate(today.getDate() - 30);

  connection.query("DELETE FROM elder WHERE remove_date <= ?", [today], (err, res) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Elders deleted:', res.affectedRows);
  });
});

module.exports = dailyJob;