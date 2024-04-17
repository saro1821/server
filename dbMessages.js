const mongoose =require ("mongoose")

const messageSchema = new mongoose.Schema({
    name:String,
    message:String,
    timestamps:String,
    uid:String,
    roomId:String
},
{
    timestamps:true,
})

const Messages=mongoose.model("message",messageSchema)
module.exports =Messages