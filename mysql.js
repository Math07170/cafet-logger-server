var mysql = require('mysql');

var connection = mysql.createPool({
  connectionLimit: 10,
  host     : '188.40.163.151',
  user     : 'u1599_nmuuN9KVkT',
  port     : '3306',
  password : 'jqzX65p1N6c63k!chY3ZAk+W',
  database : 's1599_cafetlog'
});
connection.on('error', (e) => {
    console.log(e);
})
module.exports = {
    connection
  }