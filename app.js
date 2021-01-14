//imports and set-up

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


/********************************************************************************/
// Connect to mongoDB with mongoose
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Schema for individual items on each list
const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

// Create initial items for given list

const item1 = new Item({
  name: "Welcome to the todolist!"
});
const item2 = new Item({
  name: "Hit + to add more items."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

//  Schema for all lists
const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);


/********************************************************************************/
// Routing for home list
app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find({}, function (err, items) {

    if (items.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log("Data Inserted");
      }).catch((err) => {
        console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }

  });
});

// add items to list
app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const anotherItem = new Item({
    name: itemName
  });

  anotherItem.save();

  res.redirect("/");
});

// Deletes an item with check
app.post("/delete", (req, res) => {

  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, (err) => {
    if (!err) {
      console.log("Delete successful!");
    }
  })
  res.redirect("/");
});

// Routing to create more custom Lists
app.get("/:listName", (req, res) => {

  const listName = req.params.listName;

  List.findOne({name: listName}, (err, foundList) => {
    if (!err) {
      if (!foundList) {
        //  Create a new List since one does not yet exist
        const list = new List({
          name: listName,
          items: defaultItems
        });
      
        list.save();
        // Reload
        res.redirect("/" + listName);
      } else {
        // Render Existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});


/********************************************************************************/
// Establish connection
app.listen(3000, function () {
  console.log("Server started on port 3000");
});