import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const messageScema = new Schema({
    content:{type:String,required:true}
});

const Message = new model("Message",messageScema);

export default Message;