const app = require('express')();
const {MongoClient} = require('mongodb');

const url = "mongodb+srv://ryanchen649585:Rmcmongodb05@cluster0.uqmqa6r.mongodb.net/Stock?retryWrites=true&w=majority";

const databaseName = "Stock";

let collection;

async function connectToMongoDB(){
    const client = new MongoClient(url, {
        serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true,
        },
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        ssl: true,
        sslValidate: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    try {
        await client.connect();
        const db = client.db(databaseName);
        collection = db.collection("PublicCompanies");
        console.log("Connected to MongoDB Atlas");

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
        process.exit(1);
    }
}

connectToMongoDB(); 

app.set('view engine', 'pug');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('stockTickerForm');
});

app.get('/process', async (req, res) => {
    const query = req.query.query;
    const searchType = req.query.searchType;

    try {
        let results = [];
        if (searchType === 'ticker'){
            results = await collection.find({ticker: query}).toArray();
        } else if (searchType === 'company'){
            results = await collection.find({company: {$regex: query, $options: 'i'}}).toArray();
        }

        results.forEach(company => {
            console.log(`Company: ${company.company}, Ticker: ${company.ticker}, Price: ${company.price}`);
        });

        res.render('displayResults', {results: results});
    } catch (error) {
        console.error("Error processing search:", error);
        res.status(500).send("Error processing search");
    }
});