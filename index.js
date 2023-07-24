const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wg0iu7v.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const collegeCollection = client.db("expressDB").collection("colleges");
    const infoCollection = client.db("expressDB").collection("user-info");
    const reviewCollection = client.db("expressDB").collection("review");
//get all college
    app.get("/colleges", async (req, res) => {
      const result = await collegeCollection
        .find()
        .sort({ createAt: -1 })
        .toArray();
      res.send(result);
    });

//get the college by user email
    app.get("/mycolleges", async (req, res) => {
      // console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await collegeCollection.find(query).toArray();
      res.send(result);
    });



  //search college
    app.get("/getcollegesByText", async (req, res) => {
      console.log(req.query.name);
      let query = {};
      if (req.query?.name) {
        query = { name: req.query.name };
      }
      const result = await collegeCollection.find(query).toArray();
      res.send(result);
    });




 



    // for updating college details
    app.put("/updatecollege/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const body = req.body;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            photo: body.photo,
            name: body.name,
            sellerName: body.sellerName,
            subCategory: body.subCategory,
            price: parseFloat(body.price),
            rating: body.rating,
            quantity: body.quantity,
            description: body.description,
          },
        };

        const result = await collegeCollection.updateOne(filter, updateDoc);
        if (result.modifiedCount > 0) {
          res.json({ message: "college updated successfully" });
        } else {
          res.status(404).json({ message: "college not found" });
        }
      } catch (error) {
        console.error("Error updating college:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

// --------------------------------------------User Info
//get all info
app.get("/info", async (req, res) => {
  const result = await infoCollection
    .find()
    .sort({ createAt: -1 })
    .toArray();
  res.send(result);
});

//get the info by user email
app.get("/myinfo/:email", async (req, res) => {
  const { email } = req.params;
  const result = await infoCollection.find({ 'info.email': email }).toArray();
 
  // const result = await infoCollection.find(query).toArray();
  res.send(result);
});
//adding user information
app.post("/info", async (req, res) => {
  const newinfo = req.body;
  newinfo.createAt = new Date();
  console.log(newinfo);
  const result = await infoCollection.insertOne(newinfo);
  res.send(result);
});

// review info

app.get("/review", async (req, res) => {
  const result = await reviewCollection
    .find()
    .sort({ createAt: -1 })
    .toArray();
  res.send(result);
});


//adding user review 
app.post("/review", async (req, res) => {
  const newreview = req.body;
  newreview.createAt = new Date();
  console.log(newreview);
  const result = await reviewCollection.insertOne(newreview);
  res.send(result);
});



















    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("college server is running");
});

app.listen(port, () => {
  console.log(`college Server is running on port: ${port}`);
});
