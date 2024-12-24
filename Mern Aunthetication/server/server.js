import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import connectDB from './config/mongdb.js'
import authRouter from './routes/auhRoutes.js'
import userRouter from './routes/userRouts.js'




const app = express()
const PORT = process.env.PORT || 4000
connectDB();

const allowedOrigins = ['http://localhost:5173']

app.use(express.json())
app.use(cookieParser())
app.use(cors({origin:allowedOrigins,credentials: true}))



app.get('/', (req, res) => {
    res.send('API WORKING')
})
app.use('/api/auth',authRouter)
app.use('/api/user',userRouter)


app.listen(PORT, () => console.log(`Server started on port ${PORT}`))  