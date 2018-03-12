// Require the Express Module
var express = require('express');

// Require the Mongoose Module
var mongoose = require('mongoose');

// Create an Express App
var app = express();

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');

var moment = require('moment');

var shortDateFormat = "h:mma MMMM D, YYYY"; // this is just an example of storing a date format once so you can change it in one place and have it propagate
app.locals.moment = moment; // this makes moment available as a variable in every EJS page
app.locals.shortDateFormat = shortDateFormat;

// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));

// Require path
var path = require('path');

// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));

// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));

// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/quoting_dojo');

var UserSchema = new mongoose.Schema({
    name:  { type: String, required: true, minlength: 3},
    quote: { type: String, required: true, maxlength: 255 }
}, {timestamps: true });

mongoose.model('Quote', UserSchema);

var Quote = mongoose.model('Quote');

// Routes
// Root Request
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/quotes', function(req, res){
    Quote.find({}, null, {
        sort:{
            createdAt: -1 //Sort by Date Added DESC
        }
    }, function(err, quotes) {
        if(err) {
            console.log(err)
            console.log('something went wrong');
        } else { // else console.log that we did well and then redirect to the root route
            res.render('quotes', { quotes: quotes });
        }
    });
});

app.post('/quotes', function(req, res) {
    console.log(req.body)
    var quote = new Quote({name: req.body.name, quote: req.body.quote});

    if(req.body.skip){
        res.redirect('/quotes');
    }else{
        quote.save(function(err) {
            // if there is an error console.log that something went wrong!
            if(err) {
                console.log('something went wrong');
                res.render('index', {errors: quote.errors, name: req.body.name, age: req.body.quote})
            } else { // else console.log that we did well and then redirect to the root route
                console.log('successfully added a new quote!');
                res.redirect('/quotes');
            }
        });
    }
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
});