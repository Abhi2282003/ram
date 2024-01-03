const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./user');
const Enquiry = require('./enquiry');

const app = express();
const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/register', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'vCard-personal-portfolio')));

app.post('/register', async (req, res) => {
  const { firstName, lastName, registerUsername, mobile, email, registerPassword } = req.body;

  // Validate username is provided
  if (!registerUsername) {
    return res.status(400).send('Username is required');
  }

  try {
    if (!registerPassword || typeof registerPassword !== 'string') {
      throw new Error('Invalid password');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(registerPassword, saltRounds);

    const newUser = new User({
      firstName,
      lastName,
      registerUsername,
      mobile,
      email,
      registerPassword: hashedPassword,
    });

    // Save user to the database
    await newUser.save();
    res.send('Registration successful');
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/login', async (req, res) => {
  const { registerUsername, registerPassword } = req.body;

  try {
    const user = await User.findOne({ registerUsername });

    if (!user) {
      return res.status(404).send('<script>alert("User not found");</script>');
    }

    // Check if the user has a password before attempting to compare
    if (!user.registerPassword) {
      return res.status(500).send('<script>alert("User has no password");</script>');
    }

    const passwordMatch = await bcrypt.compare(registerPassword, user.registerPassword);

    if (!passwordMatch) {
      return res.status(401).send('<script>alert("Incorrect password");</script>');
    }

    // Successful login
    console.log('Login successful:', registerUsername);

    res.sendFile(path.join(__dirname, 'vCard-personal-portfolio/abhi.html'));
  } catch (error) {
    console.error('Error during login:', error);

    // Send an alert with the error message
    res.status(500).send(`<script>alert("Internal Server Error: ${error.message}");</script>`);
  }
});


app.get('/user-details', async (req, res) => {
  try {
    // Fetch user details from the database based on the logged-in user's ID
    // Replace 'loggedInUserId' with the actual way you identify the logged-in user (e.g., from session)
    const loggedInUserId = req.user.id; // Assuming you have user information in the request object

    const user = await User.findById(loggedInUserId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send user details to the client
    const userData = {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.mobile,
    };

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/enquiry', async (req, res) => {
  const { Name, mobile, email , textArea} = req.body;

  // Validate the request
  if (!Name || !mobile || !email || !textArea) {
    return res.status(400).send('All fields are required for the enquiry');
  }

  try {
    // Create a new enquiry object
    const enquiry = new Enquiry({
      Name,
      mobile,
      email,
      textArea
    });

    // Save the enquiry to the "enquiry" database
    await enquiry.save();

    res.status(201).send('Enquiry submitted successfully');
  } catch (error) {
    console.error('Error during enquiry submission:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});