const express = require("express");
const app = express();
const bodyParser = require("body-parser"); // parse any of the data that is parses
const MongoClient = require("mongodb").MongoClient; // allows us to use MongoDB as our database

var db; //,collection;

const url = "mongodb+srv://demo:demo@cluster0-q2ojb.mongodb.net/test?retryWrites=true";
const dbName = "demo";

app.listen(3000, () => {
  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if (error) {
      throw error;
    }
    db = client.db(dbName);
    console.log("Connected to `" + dbName + "`!");
  });
});

app.set("view engine", "ejs"); // ejs will build out our template
app.use(bodyParser.urlencoded({ extended: true })); // enables us to look at any request that comes through
app.use(bodyParser.json());
app.use(express.static("public")); // teling express to set up the public folder and create a route for each file (images, favicon, fonts, css, etc)

app.get("/", (req, res) => {
  db.collection("messages")
    .find()
    .toArray((err, result) => {
      // put in an array called result
      // find() is a mongodb method it  will find all the documents in your collection and toArray will turn those documents into an array. Documents are objects
      if (err) return console.log(err);
      res.render("index.ejs", { messages: result }); // response with the html that was rendered // messages is the name we set, can be named anything
    });
});

app.post("/messages", (req, res) => {
  // .insertOne will create a new document
  db.collection("messages").insertOne({ name: req.body.name, msg: req.body.msg, thumbUp: 0 }, (err, result) => {
    if (err) return console.log(err);
    console.log("saved to database");
    res.redirect("/"); // reload the main page and fires another get request
  });
});

app.put("/messages", (req, res) => {
  db.collection("messages").findOneAndUpdate(
    { name: req.body.name, msg: req.body.msg },
    {
      $set: {
        thumbUp: req.body.thumbUp + 1,
      },
    },
    {
      sort: { _id: -1 }, // grabbing from top to bottom
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.put("/messagesDown", (req, res) => {
  db.collection("messages").findOneAndUpdate(
    { name: req.body.name, msg: req.body.msg },
    {
      $set: {
        thumbUp: req.body.thumbUp - 1,
      },
    },
    {
      sort: { _id: -1 },
      upsert: true,
    },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

app.delete("/messages", (req, res) => {
  db.collection("messages").findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
    if (err) return res.send(500, err);
    res.send("Message deleted!");
  });
});
