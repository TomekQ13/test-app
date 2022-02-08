const express = require("express")
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const { Client } = require('pg')

app.use(express.static(__dirname + '/public'));

const client = new Client({
    user: process.env.POSTGRES_RW_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_RW_PASSWORD,
    port: process.env.POSTGRES_PORT
})

client.connect()
const res = client.query('select now()').then(res => console.log('Connected to database ' + res.rows[0].now))

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    let allValues
    try {
        allValues = await client.query('select test_col from test')
    } catch (e) {
        console.error(e)
    }
    res.render('index', {values: allValues.rows})
})

app.post('/', async (req, res) => {
    let response
    try {
        response  = await client.query('insert into test (test_col) values ($1)', [req.body.value])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

app.put('/', async(req, res) => {
    try {
        await client.query('update todos set done = true where id = $1', [req.params.id])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

app.delete('/:id', async (req, res) => {
    try {
        await client.query('delete from todos where id = $1', [req.params.id])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Application started and Listening on port 3000");
  })
  
  