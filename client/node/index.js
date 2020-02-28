//var grpcExpress = require("grpc-express");
var express = require("express");
//const path = require("path");
var expjwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const exjwt = require("express-jwt");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

// open the database
let db = new sqlite3.Database(
  "../../database.sqlite",
  sqlite3.OPEN_READWRITE,
  err => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the  database, users list.");
  }
);

let sql = `SELECT
    id,
    email,
    password,
    role
    FROM
    users`;

let sql2 = `SELECT 
    id,
    email,
    password,
    role
    FROM
    users
    WHERE
    role = 'user'`;

async function getUsers() {
  //user
  await db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach(row => {});

    var app = express();

    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:7070");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-type,Authorization"
      );
      next();
    });
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const accessTokenSecret = "ErJtjG%Z9P(]-HO?p%37";

    const authenticateJWT = (req, res, next) => {
      const authHeader = req.headers.authorization;

      if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
          if (err) {
            return res.sendStatus(403);
          }

          req.user = user;
          next();
        });
      } else {
        res.sendStatus(401);
      }
    };

    let users = rows;

    //console.log(users);
    app.post("/login", (req, res) => {
      // Read username and password from request body
      const { username, password } = req.body;

      // Filter user from the users array by username and password
      const user = users.find(u => {
        return u.username === username && u.password === password;
      });

      if (user) {
        // Generate an access token
        const accessToken = jwt.sign(
          {
            username: user.username,
            role: user.role
          },
          accessTokenSecret
        );

        res.json({
          accessToken
        });
      } else {
        res.send("Username or password incorrect");
      }
    });

    const noteClient = require("../client");
    (grpc = require("grpc")),
      app.get("/users", authenticateJWT, (req, res, next) => {
        const { role } = req.user;

        if (role == "admin") {
          let grand = users;
          noteClient.list({}, error => {
            if (!error) {
              //json response
              res.send(grand);
              // console.log(req.user);
            } else {
              console.error(error);
            }
          });
        }
        if (role == "user") {
          //user
          noteClient.list({}, (error, users) => {
            if (!error) {
              //json response
              res.send(users);
              console.log(req.user);
            } else {
              console.error(error);
            }
          });
        }
        if (role == "moder") {
          db.all(sql2, [], (err, rows2) => {
            if (err) {
              throw err;
            }
            rows2.forEach(row => {});
            noteClient.list({}, error => {
              if (!error) {
                //json response
                res.send(rows2);
                // console.log(req.user);
              } else {
                console.error(error);
              }
            });
          });
        }
      });

    const port = 7070;
    app.listen(port, () => console.log(`Listening on port ${port}!`));
  });
}
getUsers();

//const db = require("../../server/config/db.js");
