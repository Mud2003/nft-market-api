const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const user = require('./routers/users.js')
const nft = require('./routers/nfts.js')
const  mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const seller = require('./routers/sellers.js')
dotenv.config();


const app = express();

app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 8000;


app.use('/api/user',user);

app.use('/api/nft',nft);

app.use('/api/seller', seller);


app.use(cors());
app.use(bodyParser.json());


//mongodb connect
const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connect(uri)
.then(()=>{
    console.log("Connected to the Mongodb...")
}).catch((err)=>{
    console.log(err)
})

app.listen( PORT,
    () => console.log(`App is running on port ${PORT}`)
);