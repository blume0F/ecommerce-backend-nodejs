const express=require('express')
const app=express()
const morgan=require('morgan')
const mongoose=require('mongoose')
const cors=require('cors')
const bcrypt=require('bcryptjs')
require('dotenv/config');
const authJwt=require('./helper/jwt')
const errorHandler=require('./helper/error-handler')

const api=process.env.API_URL;

app.use(cors())
app.options('*',cors())

//import routes
const productsRouter=require('./routers/products')
const categoriesRouter=require('./routers/categories')
const usersRouter=require('./routers/users')
const ordersRouter=require('./routers/orders')

//middlewares
app.use(express.json()) 
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler)

//Routers
app.use(`${api}/products`,productsRouter)
app.use(`${api}/categories`,categoriesRouter)
app.use(`${api}/users`,usersRouter)
app.use(`${api}/orders`,ordersRouter)

mongoose.connect(process.env.CONNECTION_MONGODB,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then(()=>{
    console.log('Database connection is successfull :]')
})
.catch((err)=>{
    console.log(err);
})

app.listen(3000,()=>{
    console.log(`Server is running on 3000 :]`);
})