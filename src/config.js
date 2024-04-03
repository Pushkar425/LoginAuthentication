const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://pushkarupadhyay425:cqXLtsSvvAj53ymp@nodeapi.uzsnxql.mongodb.net/Login?retryWrites=true&w=majority")
.then(() => {
    console.log('DataBase connected');

}).catch(() => {
    console.log('Error while conneting to database');
});


//database schema

const LoginSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }

}

);

const collection = mongoose.model('users', LoginSchema);

module.exports = collection;