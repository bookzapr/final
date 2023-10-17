const expressFunction = require('express')
const mongoose = require('mongoose')
var expressApp = expressFunction();

const url = 'mongodb://127.0.0.1:27017/db_it'
const config ={
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
};

var Schema = require("mongoose").Schema;
const userSchema = Schema({
    type: String,
    id: String,
    name : String,
    detail: String,
    quantity: Number,
    price:Number,
    file: String,
    img:String
},{
    collection: 'products'
})

let Product 
try{
    Product = mongoose.model('products');
}catch(error){
    Product = mongoose.model('products', userSchema);
}

expressApp.use((req, res, next)=>{
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers','Content-Type,Option,Authorization')
    return next()
});

expressApp.use(expressFunction.json());
expressApp.use((req, res, next) => {
    mongoose.connect(url, config).then(()=>{
        console.log('Connected to MongoDB');
        next();
    })
    .catch(err=>{
        console.log('Cannot connect to MongoDB')
        res.status(501).send('Cannot connect to MongoDB')
    })
});

const addProduct = (productData) =>{
    return new Promise((resolve, reject)=>{
        var new_product = new Product(
            productData
        );
        new_product.save().then(result =>{
            resolve({message: 'Product added successfully'})
            
        }).catch(err =>{            
            reject(new Error('Cannot insert product to DB!'))              
        });

    });
}

function validateData(req, res, next) {
    const data = req.body; 

    // ตรวจสอบว่า data มีค่าและต้องมีค่าของ name และ detail
    if (!data || !data.name || !data.detail) {
        return res.status(400).json({ error: 'Invalid data. Name and detail are required.' });
    }

    // ตรวจสอบเงื่อนไขอื่น ๆ ตามความต้องการ

    // ถ้าข้อมูลถูกต้อง, ส่งไปยัง route handlers ถัดไป
    next();
}


const getProduct = () =>{
    return new Promise((resolve, reject) => {
        Product.find({}).then(data =>{
            if (data) {
                resolve(data)
            } else {
                reject(new Error('Cannot get prodects!'))
            }
        }).catch(err=>{
            if (err) {
                reject(new Error('Cannot get prodects!'))
            }
        })
    })
}

expressApp.post('/products/add',validateData,(req,res)=>{
    console.log('add');
    addProduct(req.body)
        .then(result =>{
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err=>{
            console.log(err);
        })
});

expressApp.get('/products/get',(req, res)=>{
    console.log('add')
    getProduct()
        .then(result =>{
            console.log(result);
            res.status(200).json(result);
        })
        .catch(err=>{
            console.log(err);
        })

});


expressApp.listen(3000, function(){
    console.log('Listening on port 3000')
})