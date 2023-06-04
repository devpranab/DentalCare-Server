const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT | 5000;

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // for parsing application/json

//express http method
app.get('/', (req, res) => {
  res.send("clinics portals server is running! ps");
});

//mongodb connect start(crud)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bqc97fr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();
    // Send a ping to confirm a successful connection
    const appointmentOptionCollection = client.db('doctorsPortal').collection('appointments');
    const bookingsCollection = client.db('doctorsPortal').collection('bookings');
    const usersCollection = client.db('doctorsPortal').collection('users');

    //Post bookings
    app.post('/bookings', async (req, res) => {
      const booking = req.body;

      const query = {
        appointmentDate: booking.appointmentDate,
        treatment: booking.treatment,
        email: booking.email
      }
      const bookedDay = await bookingsCollection.find(query).toArray();
      //check if that day already have an appointment or not. If have then return a message
      if (bookedDay.length) {
        const message = `You already have a booking on ${booking.appointmentDate}. `
        return res.send({ acknowledged: false, message })
      }
      const result = await bookingsCollection.insertOne(booking)
      //send Email about appointment confirmation
      //sendBookingEmail(booking);
      res.send(result)
    });

    //Ge bookings
    app.get('/booking', async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
          return res.status(403).send({ message: 'Forbidden Access.' })
      }

      const query = { email: email }
      const bookings = await bookingsCollection.find(query).toArray()
      res.send(bookings);
  })

    //Get bookings by id

    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);
//mongodb connect end(crud)

//listen express server
app.listen(port, () => {
  console.log(`dental care server is running on ${port}`);
});

//npm start
//npm run start-dev
//localhost:5000

/*
   * API Naming Convention 
   * app.get('/bookings')
   * app.get('/bookings/:id')
   * app.post('/bookings')
   * app.patch('/bookings/:id')
   * app.delete('/bookings/:id')
*/

// const jwt = require('jsonwebtoken');
// const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);
// const nodemailer = require("nodemailer");
// const mg = require('nodemailer-mailgun-transport');