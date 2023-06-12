//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const lodash= require("lodash");
const app = express();
main().catch(err => console.log(err));
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

}
const itemsSchema={
  name:{
    type:String,
    required:[true,"cannot create and empty li"]
  }
};
var Item= mongoose.model('Item',itemsSchema);

const listSchema={
  name: String,
  items:[itemsSchema]
}

var List=mongoose.model('list',listSchema);

async function Myfunction(){


const q1= new Item({name:"Do read the books"});
const q2= new Item({name:"Do some coding"});
const q3= new Item({name:"learn something new"});
const key =await Item.find({});
//console.log(key);
if(key.length===0){
  
  await q1.save();
  await q2.save();
  await q3.save();
  
}

//{name:"Do some coding"}  ._conditions.name
const red= await Item.find({});
console.log(red);
return red;
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const workItems = [];

app.get("/", function(req, res) {

const day = date.getDate();
  
  Myfunction().then(
    function(value){
      res.render("list", {listTitle: day, newListItems: value});
    }
  )
  

});
async function deletFunc(Itemid){
  await Item.deleteOne({_id:Itemid});
}
app.post("/", function(req, res){

  const newitem = req.body.newItem;
  const title= req.body.list;
  if(title===date.getDate()){
    Item.insertMany([{name:newitem}]);
    res.redirect('/');
  }
  else{
    //console.log(title);
    List.findOne({name:title}).then(async function(req){
      const itemlist=req.items;
      itemlist.push({name:newitem});
      await List.updateOne({name:title},{items:itemlist});
      const rdlink="/"+title;
      res.redirect(rdlink);
    })
    //

  }

}); 

app.post('/delete',function(req,res){
  const Idandtitle=req.body.itemId;
  console.log(Idandtitle);
  const deleteId=lodash.slice(Idandtitle,0,24);
  const idString=deleteId.join("");
  const title=lodash.slice(Idandtitle,24,Idandtitle.length);
  const titleString=title.join("");
   console.log("no error");
  console.log(idString);
  console.log(titleString);
  if(titleString==date.getDate()){
    deletFunc(idString).then(function(){

    })
    res.redirect('/');

  }
  else{
    List.findOneAndUpdate({name:titleString},{'$pull':{"items":{"_id":idString}}}).then(
      function(err){
        const uri="/"+titleString;
        res.redirect(uri);
      }
    )

    }
    


});
app.get("/:dir", function(req,res){
  const dir=req.params.dir;
  //console.log(dir);
  const q1= new Item({name:"Do read the books"});
  const q2= new Item({name:"Do some coding"});
  const q3= new Item({name:"learn something new"});
  const itemArray=[q1,q2,q3];
  (List.findOne({name:dir})).then(function(out){
   if(!out){
    var li = new List({name:dir,items:itemArray});
    List.insertMany([li]);
    console.log(li.items);
    res.render("list",{listTitle: li.name, newListItems:li.items });
   }else{
    res.render("list",{listTitle:out.name,newListItems:out.items });
   }
  });
  

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
