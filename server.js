const express=require('express');
const http=require('http');
const path= require('path');
const socketio=require('socket.io');
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser, userLeave,getRoomusers}=require('./utils/users')
const PORT = 3000 || process.env.PORT;
const app = express();
const server=http.createServer(app);
const io =socketio(server);
const botName="Chat room"
app.use(express.static(path.join(__dirname,'public')));
io.on('connection',socket=>
{
    console.log('new connection')
    
    socket.on('joinRoom',({username,room})=>
    {
        const user=userJoin(socket.id,username,room);
        console.log(user)
        socket.join(user.room);   
        
        socket.emit('message'
        ,formatMessage(botName,'Welcome to chat'));
    
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
    })

   

    socket.on('chatMessage',msg=>
    {

       const user=getCurrentUser(socket.id); 
       io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    socket.on('disconnect',()=>
    {
        const user= userLeave(socket.id);
        
        if(user)
        {
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
        
            io.to(user.room).emit('roomUsers',
            {
                room:user.room,
                users:getRoomusers(user.room)
            })
        }

       
    })
})

server.listen(PORT,()=>
{
    console.log(`Server running on port ${PORT}`)
}); 