/* Require external APIs and start our application instance */
var express = require('express');
var mysql = require('mysql');
var app = express();

/* Configure our server to read public folder and ejs files */
app.use(express.static('public'));
app.set('view engine', 'ejs');

/* Configure MySQL DBMS */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'jmorado',
    password: 'password',
    database: 'quotesdb'
});
connection.connect();

/* The handler for the DEFAULT route */
app.get('/', function(req, res){
    res.render('searchby.ejs');
});

app.get('/home', function(req, res){
    res.render('home.ejs');
});

app.get('/bygender', function(req, res){
    res.render('bygender.ejs');
});

app.get('/gender', function(req, res){
   var stmt = "select quote, firstName, lastName from l9_author, l9_quotes where l9_author.sex='" + req.query.gender + "';";
   connection.query(stmt, function(error, results){
        if(error) throw error;
        let s = new Set();
        results.forEach(function(q){
         s.add(q.quote);
        });
        res.render('gender', {quotes: s, names: results});      
    });
});

app.get('/bycategory', function(req, res){
    res.render('bycategory.ejs');
});

app.get('/category', function(req, res){
    var stmt = "select quote, firstName, lastName from l9_quotes, l9_author where category like '%" + req.query.cat + "%';";
    connection.query(stmt, function(error, results){
        if(error) throw error;
        res.render('category', {quotes: results});      
    });
});

app.get('/bykeyword', function(req, res){
    res.render('bykeyword.ejs');
});

app.get('/keyword', function(req, res){
    var stmt = "select quote, firstName, lastName from l9_quotes, l9_author where quote like '%" + req.query.keyword + "%';";
    connection.query(stmt, function(error, results){
        if(error) throw error;
        res.render('keyword', {quotes: results});      
    });
});

/* The handler for the /author route */
app.get('/author', function(req, res){
    var stmt = 'select * from l9_author where firstName=\'' 
                + req.query.firstname + '\' and lastName=\'' 
                + req.query.lastname + '\';'
	connection.query(stmt, function(error, found){
	    var author = null;
	    if(error) throw error;
	    if(found.length){
	        author = found[0];
	        // Convert the Date type into the String type
	        author.dob = author.dob.toString().split(' ').slice(0,4).join(' ');
	        author.dod = author.dod.toString().split(' ').slice(0,4).join(' ');
	    }
	    res.render('author', {author: author});
	});
});

/* The handler for the /author/name/id route */
app.get('/author/:aid', function(req, res){
    var stmt = 'select quote, firstName, lastName ' +
               'from l9_quotes, l9_author ' +
               'where l9_quotes.authorId=l9_author.authorId ' + 
               'and l9_quotes.authorId=' + req.params.aid + ';'
    connection.query(stmt, function(error, results){
        if(error) throw error;
        var name = results[0].firstName + ' ' + results[0].lastName;
        res.render('quotes', {name: name, quotes: results});      
    });
});

/* The handler for undefined routes */
app.get('*', function(req, res){
   res.render('error'); 
});

/* Start the application server */
app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
})