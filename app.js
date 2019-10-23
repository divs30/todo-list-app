//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

//app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Divya:Divya_321@cluster0-qajsu.mongodb.net/to-do-listDB",{useNewUrlParser:true, useUnifiedTopology: true });

const itemSchema = {
    name:String
};
const Item = mongoose.model("Item",itemSchema);
const Item1 = new Item ({
  name:"Welcome todo list"

});
const Item2 = new Item ({
  name:"Hit + to add a new item"
});

const Item3 = new Item ({
  name:" <-- hit to delete the item"
});

const defaultItems = [Item1, Item2, Item3];

const listSchema = {
  name:String,
  items :[itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("Here's an error " +err);
        }
        else{
            console.log("Success ");
        }
      });
      res.redirect("/");
    }
    else{
      if(err)
      {
        console.log(err);
      }
      else {
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
    }
  });
});



app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if(listName === "Today")
  {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({name:listName}, function(err,foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    })
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create the new listTitle
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" +  customListName);
      }
      else{
        //Use the recreated list
          res.render("list", {listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });
});



app.post("/delete", function(req, res){
      const checkedItemId =  req.body.checkbox;
      const listName = req.body.listName;
      if(listName === "Todaay")
      {
        Item.findByIdAndRemove(checkedItemId, function(err){
          if(!err)
          {
            console.log("Successfully Deleted");
            res.redirect("/");
          }
        });
      }else {
        List.findOneAndUpdate({name:listName}, {$pull : { items : {_id : listName}}}, function(err, foundList){
            if(!err){
              res.redirect("/"+listName);
            }
        });
      }

});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port 3000");
});
