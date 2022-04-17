const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken')

router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash') //include - to exclude this field

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments()

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})

router.post(`/`, async (req, res) =>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('The user cannot be created!')

    res.send(user);
})

router.post('/register', async (req,res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.put(`/:id`, async (req, res) =>{

    //check if user is also changing the password if not, then just change the other fields 
    const userExist=await User.findById(req.params.id)
    let newPassword;

    //if request body contains password that means user also changed the password with other fields
    if(req.body.password){
        newPassword=bcrypt.hashSync(req.body.password,10)
    }
    //if he did not changed the password make the password same as it was earlier
    else{
        newPassword=userExist.passwordHash
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,{
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        //show new updated data in postman console  
        {new:true}
    );

    if(!user) {
        res.status(500).json({success: false,message:`The user was not found!`})
    } 
    res.status(200).send(user);
})

router.delete(`/:id`, async (req, res) =>{
    try{
        let fun=await User.findByIdAndRemove(req.params.id)
        if(!fun){
            return res.status(404).send('Cannot found this user! Deletion failed.')
        }
        else{
            res.status(200).json({success:true,message:`User deleted successfully`})
        }
    }
    catch(err){
        res.status(400).json({success:false,error:err})
    }
})

router.post('/login',async (req,res)=>{

    const user=await User.findOne({email:req.body.email})
    const jwtSecret=process.env.JWT_SECRET
    if(!user){
        return res.status(400).send('User not found')
    }

    //compare users plain text password with hashed password
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token=jwt.sign(
            {
                userId:user.id,
                isAdmin:user.isAdmin
            },
            jwtSecret,
            {expiresIn:'1d'}// custom secret key to encode and 1d to expire token in 1 day
        ) 

        res.status(200).send({user:user.email,token:token})
    }else{
        res.status(400).send('Incorrent password or email!')
    }
})


module.exports =router;