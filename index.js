const express = require('express');
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;
const app = express();

// middleware............................................................
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.geiv5ao.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const productCollection = client.db('Assesment_CRUD').collection('products');
        const userCollection = client.db('Assesment_CRUD').collection('users');

        app.get('/products', async (req, res) => {
            const query = {};
            const products = await productCollection.find(query).toArray();
            res.send(products)
        })

        // get single Product-----------------
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result)
        })
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const product = req.body;
            const filter = { _id: new ObjectId(id) };

            const options = { upsert: true };

            const updateDoc = {
                $set: product
            };
            const result = await productCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })


        // Product Add------------------
        app.post('/createproduct', async (req, res) => {
            const product = req.body;
            console.log(product);
            const result = await productCollection.insertOne(product)
            res.send(result);
        })

        // product delete--------------------
        app.delete('/deleteproduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }

            const result = await productCollection.deleteOne(query);
            res.send(result)

        })


        // Delete Multiple Products---------------
        app.delete('/deleteproducts', async (req, res) => {
            const products = req.body.select;
            // const query = {}
            // const allProduct = await productCollection.find(query).toArray();

            // const remainProduct = allProduct.filter(obj => products.includes(obj._id.toString()));
            // console.log(remainProduct);

            const result = await productCollection.deleteMany({ _id: { $in: products } });
            res.send(result)
        })


        // Register user or Create user---------------------
        app.post('/create/user', async (req, res) => {
            const user = req.body;
            const query = { Email: user?.Email }
            const saveUser = await userCollection.findOne(query);
            if (saveUser) {
                return res.send({ message: 'User already saved', ...saveUser });
            }

            const result = await userCollection.insertOne(user);
            res.send({ ...result, ...user })
        })


        // Log in user-------------------------
        app.post('/getuser', async (req, res) => {
            const user = req.body;

            const query = { Email: user?.email, Pass: user?.password };

            const saveUser = await userCollection.findOne(query)
            if (saveUser) {
                return res.send({ login: 'true', ...saveUser })
            }
            res.send({ message: 'Envalid Email Password' })
        })

        app.get('/getuser/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);

            if (id === 'null') {
                return;

            }
            const query = { _id: new ObjectId(id) }
            const user = await userCollection.findOne(query);
            res.send(user)

        })




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('Assesment server is running ')
})


app.listen(port, () => {
    console.log(`Server is running on Port ${port}`);
})