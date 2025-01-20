const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

const { MongoClient } = require('mongodb');
const req = require('express/lib/request');
//const { ObjectId } = require('mongodb/mongodb');
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
  const description = req.body.description;
  const duration = req.body.duration;
  let dateString = req.body.date;
  let date = new Date(dateString).toDateString();
  if (date == "Invalid Date"){
    date = new Date().toDateString();
  }
  console.log(date);
/*
  let filter = { _id: new ObjectId(userId) };
  let update = {
    $set: { 
      description: description,
      duration
    }
  }
*/
  res.json({ body: req.body})
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
