require('dotenv').config();

const express = require("express")
const dotenv = require("dotenv")
const http = require("http")
const { default: mongoose } = require("mongoose")
const { Server } = require("socket.io")
const routes = require("./routes")
const cors = require("cors")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const registerChatSocket = require("./socket/chatSocket")
const PaymentController = require("./controllers/PaymentController")
dotenv.config()


const app = express()
app.use(express.json({ limit: '10mb' }));  
app.use(express.urlencoded({ limit: '10mb', extended: true })); 
const port = process.env.PORT || 3001

app.use(cookieParser())

// Tập hợp các origin được phép (bao gồm cả Ngrok URL nếu có)
const allowedOrigins = ['http://localhost:3000'];
if (process.env.NGROK_URL && process.env.NGROK_URL.trim()) {
    allowedOrigins.push(process.env.NGROK_URL.trim());
}

app.use(cors({
    origin: (origin, callback) => {
        // Cho phép requests không có origin (Postman, PayOS webhook, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
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

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
})

// Gắn io vào PaymentController để push real-time khi nhận webhook
PaymentController.setIo(io);

registerChatSocket(io)

server.listen(port, '0.0.0.0', () => {
    console.log("Server is running on port: " + port)
})