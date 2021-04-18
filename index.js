const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
// const admin = require('firebase-admin');
// const serviceAccount = require(`/Web-Dev-JhankerMahmub/Milestone-11/Assignment/server/pkey.json`);
const fileUpload = require("express-fileupload");
const fs = require("fs");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
app.use(cors());
app.use(express.static("doctors"));
app.use(fileUpload());
const port = 5000;


const MongoClient = require('mongodb').MongoClient;
const  ObjectId  = require('mongodb').ObjectId;
const { allowedNodeEnvironmentFlags } = require("process");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.j1wjl.mongodb.net/fisoft?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const servicesCollection = client.db("fisoft").collection("services");
  const bookingsCollection = client.db("fisoft").collection("bookings");
  const adminsCollection = client.db("fisoft").collection("admins");
  const reviewCollection = client.db("fisoft").collection("reviews");
  // perform actions on the collection object
  //client.close();
  app.get('/services',(req,res)=>{
    servicesCollection.find().toArray((err,items) => {
       console.log('from database ',items)
       res.send(items)
    })
  })


  app.post("/addService",(req,res)=>{
    const newService = req.body;
    console.log('Adding New Service ',newService)
    servicesCollection.insertOne(newService)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount>0)
    })
  })

  app.post("/addBooking",(req,res)=>{
    const booking = req.body;
    console.log('Adding New order ',booking)
    bookingsCollection.insertOne(booking)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })

  app.get('/checkout/:id',(req,res)=>{
    const id = ObjectId(req.params.id);
    servicesCollection.find({_id:id})
    .toArray((err,documents)=>{
      res.send(documents);
    })
  })
  app.get('/bookings',(req,res)=>{
    bookingsCollection.find().toArray((err,items) => {
       console.log('from database ',items)
       res.send(items)
    })
  })
  // app.post('/bookingsByUser', (req, res) => {
  //   const bearer = req.headers.authorization;
  //   if (bearer && bearer.startsWith('Bearer')) {
  //     const idToken = bearer.split(' ')[1];
  //     console.log({idToken});
  //     admin
  //       .auth()
  //       .verifyIdToken(idToken)
  //       .then((decodedToken) => {
  //         const tokenEmail = decodedToken.email;
  //         // ...
  //         const queryEmail = req.body.email;
  //         if (tokenEmail === queryEmail)
  //         {
  //           bookingsCollection.find({ email: req.body.email }).toArray((error, documents) => {
  //             res.send(documents)
  //           })
            
  //         }
  //       })
  //       .catch((error) => {
  //         // Handle error
  //       });
  //   }
    
  // })
  app.post("/ordersByUser", (req, res) => {
    const email = req.body.email; 
    let filter = {email:req.body.email};
      bookingsCollection.find({email:email}).toArray((err,orders)=>{
       if(orders.length ===0){
         filter = email;
       }
       bookingsCollection
       .find(filter)
       .toArray((err, documents) => {
         console.log(documents);
         res.send(documents);
       });
      })
  });

  app.post("/addAdmin", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    adminsCollection.insertOne({ name, email })
  .then(result => {
      res.send(result.insertedCount > 0);
  })
  
    
  });
  
  app.get("/admins", (req, res) => {
    adminsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/isAdmin", (req, res) => {
    const email = req.body.email; 
      adminsCollection.find({email:email}).toArray((err,admins)=>{
       res.send(admins.length>0);
      })
  });
  app.post("/addReview",(req,res)=>{
    const newReview = req.body;
    console.log('Adding New Review ',newReview)
    reviewCollection.insertOne(newReview)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount>0)
    })
  })
  app.get('/reviews',(req,res)=>{
    reviewCollection.find().toArray((err,items) => {
       console.log('from database ',items)
       res.send(items)
    })
  })
  app.delete('/deleteProduct/:id',(req,res)=>{
    const id = ObjectId(req.params.id);
    servicesCollection.findOneAndDelete({_id:id})
    .then(documents =>res.send(!!documents.value))
  })

  app.patch('/updateStatus/:id',(req,res)=>{
      console.log(req.body)
      const id = ObjectId(req.params.id);
      bookingsCollection.updateOne({_id: id},
      {
          $set:{status: req.body.status}
      }
      )
      .then(result=>{
          res.send(result.modifiedCount>0);
      })
  })
  
  console.log('Database Connected');


});




app.get("/", (req, res) => {
    res.send("Hello World!");
  });
  
  app.listen(process.env.PORT || port, () => {
    console.log(`listening at http://localhost:${port}`);
  });
  