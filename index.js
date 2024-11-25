const express = require('express')
const app = express()
const cors = require('cors')
const BodyParser = require('body-parser');
const User = require('./models/schema.js');
require('dotenv').config()


app.use(cors())
app.use(express.static('public'))
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const username = req.body.username;

  if (!username) {
    return res.json({"message": 'Username is required'});
  }

  try {
    const user = new User({username: username});
    const savedUser = await user.save();
    res.json({username: savedUser.username, _id: savedUser._id});
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.json({"message": 'Username already taken'});
    }
    res.status(500).json({"message": 'Internal server error'});
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username _id');
    if (users && users.length > 0) {
      res.json(users);
    } else {
      res.json({"message": 'No users found'});
    }
  } catch (error) {
    res.status(500).json({"message": 'Internal server error'});
  }
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const userId = req.params._id;
  const description = req.body.description;
  const duration = req.body.duration;
  const date = req.body.date;

  if (!description || !duration) {
    return res.json({"message": 'Description and duration are required'});
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({"message": 'User not found'});
    }
    console.log(user);

    const exercise = {
      description: description,
      duration: parseInt(duration),
      date: date ? new Date(date).toDateString() : new Date().toDateString()
    };
    user.exercises.push(exercise);
    const savedUser = await user.save();

    res.json({
      _id: savedUser._id,
      username: savedUser.username,
      date: exercise.date,
      duration: exercise.duration,
      description: exercise.description
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({"message": 'Internal server error'});
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const from = req.query.from;
  const to = req.query.to;
  const limit = req.query.limit;

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.json({"message": 'User not found'});
    }

    if (from) {
      user.exercises = user.exercises.filter(exercise => exercise.date >= new Date(from));
    }
    if (to) {
      user.exercises = user.exercises.filter(exercise => exercise.date <= new Date(to));
    }
    if (limit) {
      user.exercises = user.exercises.slice(0, limit);
    }

    res.json({
      _id: user._id,
      username: user.username,
      count: user.exercises.length,
      log: user.exercises.map(exercise => ({
        description: exercise.description,
        duration: parseInt(exercise.duration),
        date: exercise.date
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({"message": 'Internal server error'});
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
