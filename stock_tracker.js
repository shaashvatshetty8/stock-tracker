const path = require("path");

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});
const mongoose = require("mongoose");


const port = 3000;

const Stock = require("./model/stock.js");

const express = require("express");   /* Accessing express module */
const app = express();  /* app is a request handler function */

app.use(express.static(__dirname));

const bodyParser = require("body-parser");



app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));

app.use(bodyParser.urlencoded({extended:false}));
const router = express.Router();
app.use(express.static(__dirname));

/* GOT HELP FROM: https://stackoverflow.com/questions/5809788/how-do-i-remove-documents-using-node-js-mongoose*/
router.post("/delete/:stock_id",async (request,response)=>{
    const stock_id = request.params.stock_id;
    await Stock.findByIdAndDelete(stock_id);
    response.redirect("/watchlist");
})
router.get("/",(request,response) =>{
    response.render("index");
});

router.get("/add",(request,response)=>{
    response.render("add");
});
router.get("/watchlist",async (request,response) =>{
    const stocks = await Stock.find({});
    /*
    added because was being treated as object type when shouldn't be
    */
    for (const stock of stocks){
        stock._id = stock._id.toString();
    }
    response.render("watchlist",{stocks});
});

/*
FOr reference as to how the data is stored
{
    "Global Quote": {
        "01. symbol": "IBM",
        "02. open": "310.5700",
        "03. high": "311.0500",
        "04. low": "303.3300",
        "05. price": "309.2400",
        "06. volume": "2953374",
        "07. latest trading day": "2025-12-12",
        "08. previous close": "310.7400",
        "09. change": "-1.5000",
        "10. change percent": "-0.4827%"
    }
}

*/

router.post("/add", async (request,response) =>{
    try{
        let symbol = request.body.symbol;
        symbol = symbol.toUpperCase();

        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.API_KEY}`;
        const data = await fetch(url);
        const json = await data.json();

        const new_stock = new Stock({
            symbol: json["Global Quote"]["01. symbol"],
            open: Number(json["Global Quote"]["02. open"]),
            high: Number(json["Global Quote"]["03. high"]),
            low: Number(json["Global Quote"]["04. low"]),
            price:Number(json["Global Quote"]["05. price"]),
            volume: Number(json["Global Quote"]["06. volume"]),
            latestTradingDay: json["Global Quote"]["07. latest trading day"],
            previousClose: Number(json["Global Quote"]["08. previous close"]),
            change: Number(json["Global Quote"]["09. change"]),
            changePercent: json["Global Quote"]["10. change percent"]


        });

        let flag = await Stock.findOne({symbol:symbol});
        if (flag){
            return response.render("add");
        }
        await new_stock.save();

        const stocks = await Stock.find({});
        
        response.render("watchlist",{stocks});

    }catch(e){
        console.log(e);
    }
});

app.use("/",router);
(async () => {
    try{
        await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
        app.listen(port);
        console.log(`Try: http://localhost:${port}`);
    }
    catch(e){

        console.log(e);
    }
})();
