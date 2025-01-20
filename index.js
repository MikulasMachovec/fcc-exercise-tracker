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
  // 678e83045f84f0218c897ffc
  let filter = { _id: new ObjectId(userId) };
  let update = {
    $set: { 
      description: inputDescription,
      duration: numDuration,
      date: date
    }
  }
  const option = {
    ReturnDocument: "after",
    upsert: true
  }
  const result = await exercise.findOneAndUpdate(filter,update,option);
  console.log(result);
  res.json({
    username: result.username,
    description: inputDescription,
    duration: numDuration,
    date: date,
    _id: userId
  })
    
})

//get logs
app.get('api/users/:_id/logs', async (req,res) => {
  
  res.json({ result: 'rel' })
})




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
