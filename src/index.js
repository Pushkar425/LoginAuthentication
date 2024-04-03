const express = require('express');
const path    = require('path');
const bcrypt  = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');

const collection = require('./config');

const app     = express();

app.use(express.json());

app.use(express.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(session({
    secret: 'secret',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.get('/', (req, res) => {
    res.render("login", { message: req.flash() });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/passreset', async (req, res) => {
    res.render('passreset', { messages: req.flash() } );
});


app.post('/signup', async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    const existingUser = await collection.findOne({name:req.body.username});

    if(existingUser){

        res.send('User name already exist, Please try another name');

    }else{

        //hassing the password

        const saltLength = 10;
        const hashPassword = await bcrypt.hash(data.password, saltLength);

        data.password = hashPassword;

        //const userData = await collection.insertMany(data);
        const userData = await collection.create(data);
        if(!userData){
            
            res.send("Unable to Sign Up, please try again!");

        }else{
            res.render('home');
            console.log(userData);
        }
    
        
        
    }

    

});


app.post('/login', async (req, res) => {

    try{

        const findUser = await collection.findOne({name: req.body.username});

        if(!findUser){
             res.send('User Not Exist. Please sign up first');
            
        }

        const isPasswordExist = await bcrypt.compare(req.body.password, findUser.password);
        if(isPasswordExist){
            res.render('home');
        }else{
            //res.send('Invalid Password');
            req.flash("message", "Invalid Password");
            //res.render('login', { message: req.flash('message') });
            res.redirect('/');
        }

    }catch (error){

        req.flash("message", "Invalid Details");
        res.redirect('/');
        //res.render('login', { message: req.flash('message') });
        //res.render('login', { messages: 'Invalid' });
        //res.send('Invalid Details');
        
    }

    


});

app.post('/passreset', async (req, res) => {

    try{
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmpassword;

    const username = await collection.findOne({name:req.body.username});
     
    if(!username){
        //const showingData = {error: "User Not exist please signup first"};
        //res.render('signup', showingData);
        //res.send('User not exist');
         req.flash("error", "User not exist");
        res.redirect('/passreset');
    }else{

        const saltLength = 10;
        if(newPassword != confirmPassword){
            //res.send('Password must be same');
            req.flash("error", "Password must be same");
        res.redirect('/passreset');
        }else{

            const hashPassword = await bcrypt.hash(newPassword, saltLength);
            const updatedData = await collection.updateOne({name:username.name},{$set:{password: hashPassword}});
            if(!updatedData){
                //res.render('passreset', {error: "Please try again."});
                res.send('Please try again')
            }else{
               // res.render('login', {success: "Password Updated Successfully. Please login"});
               //res.send('Password Updated!');
               req.flash("success", "Password Updated!");
                res.redirect('/');
            }
        }

    }
}catch(err){
    res.send(err);
}

});


app.listen(5000, () =>{
    console.log("Server is running on Port: 5000");
});