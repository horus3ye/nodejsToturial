var express = require('express');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var session = require('express-session');

var con = mysql.createConnection({
    host:"127.0.0.1",
    user:"root",
    password:"",
    database:"nodejs"
});



var app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.listen(5500);
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({secret:"session"}));


function isProductInCart(cart,id) {
    
    for (let i=0; i < cart.length; i++) {
        if (cart[i].id == id) {
            return true;
        }
    }
    return false;
}

function InCartAdd(cart,id) {
    
    for (let i=0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart[i].quantity = parseInt(cart[i].quantity)+1;
        }
    }
}

function calcTotal(cart,req) {
    total = 0;
    for (let i=0; i < cart.length; i++) {
        total = total + (cart[i].price*cart[i].quantity);
        req.session.total = total;
    }
    return total
}


app.get('/',function(req,res) {

    con.query("SELECT * FROM products LIMIT 3",(err,result)=>{
        res.render("pages/index",{result:result})
    })

});


app.get('/products',function(req,res) {

    con.query("SELECT * FROM products",(err,result)=>{
        res.render("pages/products",{result:result})
    })

});


app.get('/about',function(req,res) {

    res.render("pages/about")

});

app.get('/products',function(req,res) {

    res.render("pages/products")

});

app.get('/contact',function(req,res) {

    res.render("pages/contact")

});

app.get('/special',function(req,res) {

    res.render("pages/special")

});

app.post('/addToCart',function(req,res) {

    if(req.body.discount){
        var price = req.body.discount 
    }else {
        var price = req.body.price
    }
    var id = req.body.id;
    var name = req.body.name;
    var price = price;
    //var discount = req.body.discount;
    var quantity = req.body.quantity;
    var image = req.body.image;
    var product = {
                    id:id,
                    name:name,
                    price:price,
                    quantity:quantity,
                    image:image
                }

    if (req.session.cart)
    {
        var cart = req.session.cart;
        if(!isProductInCart(cart,id)){
            cart.push(product);
        } else {
            InCartAdd(cart,id)
        }
    }
    else
    {
        req.session.cart = [product];
        var cart = req.session.cart;
    }

    calcTotal(cart,req);

    res.redirect('/cart');

});

app.post('/removeFromCart',function(req,res) {
    var id = req.body.id;
    var cart = req.session.cart;

    for (let i=0; i < cart.length; i++) {
        if (cart[i].id == id) {
            cart.splice(cart.indexOf(i),1)
        }
    }

    calcTotal(cart,req);

    res.redirect('/cart');
});

app.post('/editQuan',function(req,res) {

    var id = req.body.id;
    var quantity = req.body.quantity;
    var cart = req.session.cart;
    var quanplus = req.body.quanplus;
    var quanminus = req.body.quanminus;

    if(quanplus){
        for (let i=0; i < cart.length; i++) {
            if (cart[i].id == id) {
                if(cart[i].quantity > 0) {
                    cart[i].quantity = parseInt(cart[i].quantity)+1; 
                }
            }
        }
    }

    if(quanminus){
        for (let i=0; i < cart.length; i++) {
            if (cart[i].id == id) {
                if(cart[i].quantity > 1) {
                    cart[i].quantity = parseInt(cart[i].quantity)-1; 
                }else {
                    cart.splice(cart.indexOf(i),1)
                }
            }
        }
    }
    

    calcTotal(cart,req);

    res.redirect('/cart');
});

app.get('/cart',function(req,res){
    
    var cart = req.session.cart;
    var total = req.session.total;
    res.render('pages/cart',{cart:cart,total:total});

});

app.get('/checkout',function(req,res){
    var total = req.session.total;
    res.render('pages/checkout',{total:total});
});

app.post('/placeOrder',function(req,res){

    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var city = req.body.city;
    var address = req.body.address;
    var cost = req.session.total;
    var status = "Not paid";
    var date = new Date();
    var con = mysql.createConnection({
        host:"127.0.0.1",
        user:"root",
        password:"",
        database:"nodejs"
    });
    var product_ids = "";
    var cart = req.session.cart;
    for (let i=0;i < cart.length; i++){
        product_ids = product_ids + "," + cart[i].id;
    }
    
    con.connect((err)=>{
        if(err){
            console.log(err)
        } else {
            var query = "INSERT INTO orders(cost,name,email,status,city,address,phone,date,products_ids) VALUES ?"
            var values = [[cost,name,email,status,city,address,phone,date,product_ids]];
            con.query(query,[values],(err,result)=>{
                res.redirect('/payment')
            })
        }
    })
});

app.get('/payment',function(req,res){
    var total = req.session.total;
    res.render('pages/payment',{total:total})
})