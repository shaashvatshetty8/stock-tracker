const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({

    symbol:{
        type:String,
        required:true,
    },
    open:{
        type:Number,
        required:true,
    },
    high:{
        type:Number,
        required:true,
    },
    low:{
        type:Number,
        required:true,
    },
    price:{
        type:Number,
        required:true,
    },
    volume:{
        type:Number,
        required:true,
    },
    latestTradingDay:{
        type:String,
        required:true,
    },
    previousClose:{
        type:Number,
        required:true,
    },
    change:{
        type:Number,
        required:true,
    },
    changePercent:{
        type:String,
        required:true,
    }


});
const Stock = mongoose.model("Stock",stockSchema);
module.exports = Stock;