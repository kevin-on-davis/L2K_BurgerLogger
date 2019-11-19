var express = require("express");
var exphbs = require("express-handlebars");
var mysql = require("mysql");
const path = require("path");
let db;

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// app.use(express.static("public"));

class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
  }
  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, args, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
  close() {
    return new Promise((resolve, reject) => {
      this.connection.end(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

if (process.env.JAWSDB_URL) {
  db = new Database(process.env.JAWSDB_URL);
} else {
  db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "IamTheBoxGhost1971",
    database: "burger_bucketlist_db"
  });
}

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.get("/burgers", async function(req, res) {
  let result = await db.query(`SELECT * FROM wishlist`);
  res.send(result);
});

app.get("/consumed", async function(req, res) {
  let result = await db.query(`SELECT * FROM consumed`);
  res.send(result);
});

// Create a new wishlist entry
app.post("/api/burgers/wishlist/:burgerName", async function(req, res) {
  result = await db.query(`insert into wishlist(burger) values (?)`, [
    req.params.burgerName
  ]);

  res.json({
    id: result.insertID,
    name: req.params.burgerName
  });
});

// Move entry from wishlist table to consumed table
app.post(`/api/burgers/consumed/:burgername`, async function(req, res) {
  let ins_con = await db.query(
    "insert into consumed(burger) select burger from wishlist where burger = ?",
    [req.params.burgername]
  );

  let del_wish = await db.query("delete from wishlist where burger =?", [
    req.params.burgername
  ]);

  let result = await db.query(`select * from consumed where burger = ?`, [
    req.params.burgername
  ]);
  res.send(result);
});

app.delete(`/api/burgers/delete/:burgername`, async function(req, res) {
  let del_consumed = await db.query("delete from consumed where burger =?", [
    req.params.burgername
  ]);
  console.log(del_consumed);
  res.send(del_consumed);
});

// Retrieve all wishlist entries
app.get("/api/burgers/wishlist", async function(req, res) {
  result = await db.query("SELECT * FROM wishlist");
  res.json(result);
});

// Retrieve all consumed entries
app.get("/api/burgers/consumed", async function(req, res) {
  await db.query("SELECT * FROM consumed");
  res.json(data);
});

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function() {
  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});
