const app = require('express')();
const {MongoClient} = require('mongodb');

const url = "mongodb+srv://ryanchen649585:Rmcmongodb05@cluster0.uqmqa6r.mongodb.net/Stock?retryWrites=true&w=majority";

const databaseName = "Stock";

let collection;

async function connectToMongoDB(){
    const client = await MongoClient.connect(url);
    
    try {
        const db = client.db(databaseName);
        collection = db.collection("PublicCompanies");
        console.log("Connected to MongoDB Atlas");

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
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
    }
});