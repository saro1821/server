const express = require("express");
const mongoose = require("mongoose");
const Rooms = require("./dbRooms");
const cors = require("cors");
const Messages = require("./dbMessages");
const Pusher = require("pusher");

const app = express();

const pusher = new Pusher({
  appId: "1789349",
  key: "447efe6e46f90442685e",
  secret: "577ebc05944d13464179",
  cluster: "ap2",
  useTLS: true
});

app.use(cors());
app.use(express.json());

const dbUrl = "mongodb+srv://saravanan7604975:admin123@cluster0.x3vnr4v.mongodb.net/";

mongoose.connect(dbUrl)
const db = mongoose.connection;

db.once("open", () => {
  console.log("DB connected");

  const roomCollection =db.collection("rooms")
  const changeStream =roomCollection.watch()

  changeStream.on("change",(change)=>{
    if(change.operationType ==="insert"){
      const roomDetails=change.fullDocument
      pusher.trigger("room","inserted",roomDetails)
    }
    else{
      console.log("Not expected event to trigger");
    }
  })
 
  const msgCollection =db.collection("messages")
  const changeStream1 =msgCollection.watch()
  changeStream1.on("change",(change)=>{
    if(change.operationType ==="insert"){
      const messageDetails=change.fullDocument
      pusher.trigger("messages","inserted",messageDetails)
    }
    else{
      console.log("Not expected event to trigger");
    }
  })
 

})

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.post("/messages/new",(req,res)=>{
    const dbMessage = req.body;
    try {
        const data=Messages.create(dbMessage)
        return res.status(201).send(data)
    } catch (error) {
        return res.status(500).send(error)
    }
})
app.post("/group/create", async (req, res) => {
  const { groupName } = req.body;
  try {
    const data = await Rooms.create({ name: groupName });
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/all/rooms",async(req,res)=>{
    try {
        const data =await Rooms.find({})
        res.status(200).send(data)
    } catch (error) {
        res.status(500).send(error)
    }
   
});
app.get("/room/:id",async(req,res)=>{
    try {
        const data =await Rooms.find({_id:req.params.id})
        res.status(200).send(data[0])
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/messages/:id",async(req,res)=>{
  try {
    const data =await Messages.find({roomId:req.params.id})
        res.status(200).send(data)
  } catch (error) {
    res.status(500).send(error)
  }
})

app.listen(5000, () => {
  console.log("server is up and running");
});
