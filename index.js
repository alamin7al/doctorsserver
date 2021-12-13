const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')('sk_test_51K4VazLqEpkIafbh3hDVQ5aiysdBevIVgu5YFBz4JUgushUC3y1nPvcVW0rK1BR5EubnRNlSnKg7jOLxngrqzjc900MPyCWio5')
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://doctodb:qGqCa5bn3Y57LEdY@cluster0.ow5x2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db('doctors_portal');
        const appointmentsCollection = database.collection('appointments');
        const userCollection = database.collection('users')

        app.post('/appointement', async (req, res) => {
            const appointement = req.body
            const result = await appointmentsCollection.insertOne(appointement)
            res.json(result)
        })

        app.get('/appointement', async (req, res) => {
            const email = req.query.email
            const date = req.query.date
            const query = { email: email, date: date }
            const cursor = appointmentsCollection.find(query)
            const appointements = await cursor.toArray()
            res.json(appointements)
        })
        app.get('/appointement/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await appointmentsCollection.findOne(query)
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            console.log(result);
            res.send(result)
        })
        app.put('/users', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = { $set: user }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await userCollection.updateOne(filter, updateDoc,)
            res.send(result)
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await userCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })

        app.post("/create-payment-intent", async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100
            const paymentIntent = await stripe.paymentIntents.create({

                currency: "usd",
                amount: amount,
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret,
            });

        })




        console.log('h');


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Doctors portal!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})