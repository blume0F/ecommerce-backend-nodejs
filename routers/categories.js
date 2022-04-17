const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})

router.get(`/:id`, async (req, res) =>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({success: false,message:`The category with ID:${req.params.id} was not found!`})
    } 
    res.status(200).send(category);
})

router.put(`/:id`, async (req, res) =>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,{
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color
        },
        //show new updated data in postman console  
        {new:true}
    );

    if(!category) {
        res.status(500).json({success: false,message:`The category with ID:${req.params.id} was not found!`})
    } 
    res.status(200).send(category);
})

router.post(`/`, async (req, res) =>{
    let category=new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    })

    category=await category.save();
    if(!category)
    return res.status(404).send('Failed to create category')

    res.send(category)
})

router.delete(`/:id`, async (req, res) =>{
    try{
        let fun=await Category.findByIdAndRemove(req.params.id)
        if(!fun){
            return res.status(404).send('Cannot found this category! Deletion failed.')
        }
        else{
            res.status(200).json({success:true,message:`Category with ID:${req.params.id} is deleted successfully`})
        }
    }
    catch(err){
        res.status(400).json({success:false,error:err})
    }
})

module.exports =router;