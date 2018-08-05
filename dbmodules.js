
var mysql = require('mysql');

var con = mysql.createConnection({
    host: "localhost",
    user: "dbadmin",
    password: "Password",
    database: "astaclick"
});

con.connect(function (err) {
    if (err) console.log("error DB", err)
    else console.log("Connected to DB!");
});

var db = {
    // QUERY ADMIN
    checkAdminLogin: function (email, password, callback) {
        var sql = "SELECT * FROM admin where email='" + email + "' and password='" + password + "'";
        con.query(sql, function (err, result) {
            if (err) {
                console.log("errore", err);
                return null;
            }
            else {
                callback(result);
            }
        });
    },

    checkUserLogin: function (email, password, callback) {
        var sql = "SELECT * FROM user where email='" + email + "' and password='" + password + "'";
        con.query(sql, function (err, result) {
            if (err) {
                console.log("errore", err);
                return null;
            }
            else {
                callback(result);
            }
        });
    },

    // QUERY ASTE
    selectAllAuctions: function () {
        var sql = "SELECT id, name, value, end, winner, status FROM aste";

        con.query(sql, function (err, result) {
            if (err) console.log(err);
            else console.log(result)
        });
    },

    selectActiveAuction: function () {
        var sql = "select id, name, value, end from auction where status=1"

        con.query(sql, function (err, result) {
            if (err) console.log(err);
            else console.log(result)
        });
    },

    selectAuctionFromId: function (id) {
        var sql = "select * from auction where id=" + id;

        con.query(sql, function (err, result) {
            if (err) console.log(err);
            else console.log(result)
        });
    }
}

module.exports = db;