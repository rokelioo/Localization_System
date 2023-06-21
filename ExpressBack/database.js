const mysql = require('mysql2');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    //password: 'elder123',
    database: 'elderdb'
  });
  

  module.exports = connection;