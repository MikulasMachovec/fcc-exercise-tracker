const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const { MongoClient, ObjectId, ReturnDocument } = require('mongodb');
const client = new MongoClient(process.env.DB);
const db = client.db('workout');
const exercise = db.collection('exercises');

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// add new user
app.post('/api/users', async (req,res) => {
  const username = req.body.username;
  if(!username){
    res.json({ error: "missing username" })
  }else {
    const user = { username: username}
    const insert_username = await exercise.insertOne(user); 
    const user_ID = await exercise.findOne({ username: username })
    res.json({ username: user_ID.username, _id: user_ID._id})
  }
})

//return all users
app.get('/api/users', async (req,res) => {
  const allUsers = await exercise.find().toArray();
  res.json(allUsers)
})
//add exercises
app.post('/api/users/:_id/exercises', async (req,res)=>{
  const userId = req.params._id;
  const inputDescription = req.body.description;
  const inputDuration = req.body.duration;
  const numDuration = parseFloat(inputDuration); 
  const dateString  = req.body.date;
  let date = new Date(dateString).toDateString();
  if (date == "Invalid Date"){
    date = new Date().toDateString();
  }
  // 678fc5e3acb56220cf408f8a
  const user = await exercise.findOne({_id: new ObjectId(userId)});
  //
  let exerciseLog = {
    description: inputDescription,
    duration: numDuration,
    date: date
  };

  const result = await exercise.updateOne(
    { _id: new ObjectId(userId) },
    {
      $push: {log: exerciseLog},
      $inc: { count: 1 }
    }
  )
  res.json({
    username: user.username,
    description: inputDescription,
    duration: numDuration,
    date: date,
    _id: userId
  })
    
})

//get logs
app.get('/api/users/:_id/logs', async (req,res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  console.log(req.url)
  if(!ObjectId.isValid(userId)){
    return req.statusCode(400).send({ error: "Invalid user ID" })
  }

  const user = await exercise.find({ _id: new ObjectId(userId) }).toArray();

  if(!user){
    return req.statusCode(400).send({ error: "User not found" })  
  }

  let logs = user[0].log;

  if(from){
    const fromDate = new Date(from);
    if(isNaN(fromDate)){
      return req.statusCode(400).send({ error: "Invalid From date" })      
    } else {
      logs = logs.filter(log => new Date(log.date) >= fromDate)
    }
  }

  if(to){
    const toDate = new Date(to);
    if(isNaN(toDate)){
      return req.statusCode(400).send({ error: "Invalid To date" })
    } else {
      logs = logs.filter(log => new Date(log.date) <= toDate)
    }
  }

  if(limit){
    const limitNumber = parseInt(limit, 10);
    if(isNaN(limitNumber) || limitNumber < 1){
      return req.statusCode(400).send({ error: "Invalid limit value" })
    } else{
      logs = logs.slice(0, limitNumber);
    }
  }

  const response = {
    _id: user[0]._id,
    username: user[0].username,
    count: user[0].count, 
    log: logs
  }

  res.send(response)
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
