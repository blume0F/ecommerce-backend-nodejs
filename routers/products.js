const {Product}=require('../models/product')
const express=require('express');
const { Category } = require('../models/category');
const router=express.Router();
const mongoose = require('mongoose');
const multer=require('multer')

const FILE_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}

//from multer npm diskStorage section how to upload file and renaming (adding date) to your files so they are unique
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid=FILE_TYPE_MAP[file.mimetype]
      let uploadError=new Error('invalid image type')
      if(isValid){
          uploadError=null
      }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const extension=FILE_TYPE_MAP[file.mimetype]
      const fileName=file.originalname.split(' ').join('-')
      cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
  })
  
const uploadOptions = multer({ storage: storage })

router.get(`/`,async (req,res)=>{    

    // localhost:3000/api/v1/products?categories=2342342,234234

    //when filter is empty get all the products and if there are query params get products by category filter
    let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    //populate is like primary key schema relation, it just shows category in product 
    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get(`/:id`,async (req,res)=>{
    const product=await Product.findById(req.params.id).populate('category')
    
    if(!product){
        res.status(500).json({success:false,message:`Could not find product by ID:${req.params.id}`})
    }
    res.send(product)
})

router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments()

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})

router.get(`/get/featured/:count`, async (req, res) =>{

    //if count is present in req params then count = that count otherwise 0
    const count=req.params.count? req.params.cound:0
    const productCount = await Product.find({isFeatured:true}).limit(+count) //added + to convert to number

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send(productCount);
})

router.post(`/`,uploadOptions.single('image'), async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    //if user doesnt posts image throw error
    const file=req.file;
    if(!file) return res.status(400).send('No image uploaded')

    const fileName=req.file.filename
    const basePath=`${req.protocol}://${req.get('host')}/public/upload/`

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    })

    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created')

    res.send(product);
})


router.put('/:id',uploadOptions.single('image'),async (req, res)=> {

    //validate for invalid id provided in api
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid product ID provided');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('Invalid Product!');

    const file = req.file;
    let imagepath;

    //update req : if the user doesnt uploads the new image keep the old image, otherwise new one
    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },
        { new: true }
    );

    if (!updatedProduct) return res.status(500).send('The product could not be updated!');

    res.send(updatedProduct);
})

router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'The product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "Product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

//multiple image uploads
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});

module.exports = router