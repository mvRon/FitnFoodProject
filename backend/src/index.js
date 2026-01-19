require('dotenv').config();

const express = require("express")
const dotenv = require("dotenv")
const { default: mongoose } = require("mongoose")
const routes = require("./routes")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
dotenv.config()


const app = express()
app.use(express.json({ limit: '10mb' }));  
app.use(express.urlencoded({ limit: '10mb', extended: true })); 
const port = process.env.PORT || 3001

app.use(cookieParser())



// app.use(cors())
app.use(cors({
    // origin: '*', // Đúng với frontend của bạn
    origin: ['http://localhost:3000'],
    credentials: true,
}));
app.use(bodyParser.json())


routes(app);

mongoose.connect(`${process.env.MONGO_DB}`)
    .then(() => {
        console.log("Connected succesfully!")
    })
    .catch((err) => {
        console.log(err)
    })


app.listen(port, '0.0.0.0', () => {
    console.log("Server is running on port: " + port)
})