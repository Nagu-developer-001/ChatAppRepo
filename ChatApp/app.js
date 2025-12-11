//const express = require("express");
import express from "express";
import { Server } from "socket.io";
import { createServer } from 'http';
import mongoose from 'mongoose';
//const {createServer} = require("node:http");
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Message from './models/messages.js';
// /import { Server } from 'socket.io';


const app = express();
const port = 3000;

const server = createServer(app);
const io = new Server(server,{
    connectionStateRecovery:{}
});
const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/",(req,res)=>{
    res.sendFile(join(__dirname,"index.html"));
});


// io.on('connection', (socket) => {
//     console.log('a user connected');
//     socket.on('disconnect', () => {
//     console.log('user disconnected');
//     });
// });
//io.emit('hello', 'world'); 
// io.on('connection', (socket) => {
//    
// });
io.on('connection', async(socket) => {
    console.log('a user connected');
    socket.broadcast.emit('hi');
    let lastMessage;
    socket.on('chat message', async(msg) => {
        try{
            lastMessage = await Message.create({content:msg});
        }catch(err){
            return
        }
        console.log('message: ' + msg);
        io.emit('chat start', msg,lastMessage._id.toString());
    });
    // socket.on("chat start msg",(msg)=>{
    //     console.log("chat has been started:"+msg);
    // io.emit("chat start msg",msg);
    // });
    if (!socket.recovered) {
    // handle new connection
    let LD = socket.handshake.auth.serverOffset;
    try{
        lastMessage = LD ? await Message.find({_id:{$gt:new mongoose.Types.ObjectId(LD)}}) : await Message.find();
        for(let message of lastMessage){
        socket.emit("chat start",message.content,message._id);
    } 
    }catch(err){
        return;
    }
    
}});




server.listen(port,async ()=>{
    const connectDB = await mongoose.connect("mongodb+srv://tvmgroupofltd_db_user:Dv9M7j3GovJOC4fT@appvideocall.9wy5mn8.mongodb.net/?appName=AppVideoCall");
    console.log(`Connected to MongoDB : HOST = ${connectDB.connection.host}`);
    console.log(`Server is running on ${port}`);
    console.log(typeof app); // "function"
    //console.log(server instanceof require('http').Server); // true
});