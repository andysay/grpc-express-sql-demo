//env
// grpc micro service

const env = require("../server/config/env");

// cross-lang mode
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

// express

const express = require("express");
const app = express();
app.use((req, res, next) => {
  res.header("Content-Type", "application/json");
  next();
});

// sequelize settings

const db = require("../server/config/db.js");

// main function
async function tryConnect() {
  try {
    const auth = await db.sequelize.authenticate();
    if (!auth) {
      //admin add
      await db.users
        .findOne({ where: { email: "yangxe@mail.ru" } })
        .then(async function(user) {
          if (user == null) {
            await db.users
              .create({
                email: "yangxe@mail.ru",
                password: "admin",
                role: "admin"
              })
              .then(newUser => {
                console.log("admin added");
              });
          } else {
            console.log("admin exist");
          }
        });
      //user add
      await db.users
        .findOne({ where: { email: "user@user.com" } })
        .then(async function(user) {
          if (user == null) {
            await db.users
              .create({
                email: "user@user.com",
                password: "user",
                role: "user"
              })
              .then(newUser => {
                console.log("user added");
              });
          } else {
            console.log("user exist");
          }
        });
      //moder add
      await db.users
        .findOne({ where: { email: "moder@moder.com" } })
        .then(async function(user) {
          if (user == null) {
            await db.users
              .create({
                email: "moder@moder.com",
                password: "moder",
                role: "moder"
              })
              .then(newUser => {
                console.log("moder added");
              });
          } else {
            console.log("moder exist");
          }
        });
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }

  //NOT DELETE
  /*
  //grpc settings
  const proto = await protoLoader.loadSync("proto/users.proto");
  const usersProto = await grpc.loadPackageDefinition(proto);
  const server = await new grpc.Server();
  const notes = [
    { id: "1", title: "Note 1", content: "content 1" },
    { id: "2", title: "Note 2", content: "content 2" }
  ];

  server.addService(usersProto.Users.UsersService.service, {
    // list users

    list: (call, callback) => {
      console.log(notes);
      callback(null, notes);
    }
  });

  //service settings

  server.bind("127.0.0.1:50051", grpc.ServerCredentials.createInsecure());

  //server start
  server.start();
  if (server.started) {
    console.log("Server running at http://127.0.0.1:50051");
  } */

  //NOT WORK NOW ?? ASYNC PROBLEM

  //const packageDefinition = protoLoader.loadSync("proto/users.proto");
  //const notesProto = grpc.loadPackageDefinition(packageDefinition);

  //OLD METHOD WORKING NOW FINE
  const UsersProto = grpc.load("proto/users.proto");
  const Users = await db.users.findOne({
    where: { email: "yangxe@mail.ru" }
  });

  var user = [Users.dataValues];

  const users = user;
  const server = new grpc.Server();

  //const metadata = new grpc.Metadata();
  //console.log(metadata);

  server.addService(UsersProto.Users.UsersService.service, {
    list: async (call, callback) => {
      await callback(null, users);
    }
  });
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    port => {
      server.start();
      if (server.started) {
        console.log("Server running at http://127.0.0.1:50051");
      }
    }
  );
}
// init

tryConnect();
