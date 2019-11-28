const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db;

MongoClient.connect('mongodb://localhost:27017/product', { useNewUrlParser: true }, (err, database) => {
  if (err) return console.log(err)
  db = database.db('product')
  app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port 3000')
  })
})

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('public'))

// Redirect to list
app.get('/', (req, res) => {
   res.redirect('/list')
})

// List all product
app.get('/list', (req, res) => {
  var sort = { name: 1 };
  db.collection('product').find().sort(sort).toArray((err, result) => {
    if (err) return console.log(err)
    res.render('list.ejs', { product: result })
  })
})

// Show the add product form
app.get('/add', (req, res) => {
   res.render('add.ejs', {})
})

// Add a product to the db
app.post('/add', (req, res) => {
  db.collection('product').insertOne(req.body, (err, result) => {
    if (err) return console.log(err)
     res.redirect('/list')
  })
})

// Show the search form
app.get('/search', (req, res) => {
   res.render('search.ejs', { product: '' })
})

// Find a product
app.post('/search', (req, res) => {
 var query = { name: req.body.name }
 db.collection('product').find(query).toArray(function(err, result) {
   if (err) return console.log(err)
   if (result == '')
       res.render('search_not_found.ejs', {})
   else
       res.render('search_result.ejs', { product: result[0] })
 });
})

// Delete a product
app.post('/delete', (req, res) => {
  db.collection('product').findOneAndDelete({ name: req.body.name }, (err, result) => {
    if (err) return res.send(500, err)
    res.redirect('/list')
  })
})
