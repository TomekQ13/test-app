const express = require("express")
const app = express()
const { v4: uuidv4 } = require('uuid');
const methodOverride= require('method-override');
app.use(methodOverride('_method'))

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

app.get('/', async (_req, res) => {
    let todos
    try {
        todos = await client.query('select id, text, done from todos')
    } catch (e) {
        console.error(e)
    }
    console.log(todos)
    todos_todo = todos.rows.filter(todo => todo.done === false)
    todos_done = todos.rows.filter(todo => todo.done === true)

    res.render('index', {todos_todo: todos_todo, todos_done: todos_done})
})

app.post('/', async (req, res) => {
    let response
    try {
        response  = await client.query('insert into todos (id, text) values ($1, $2)', [uuidv4(), req.body.text])
    } catch (e) {
        console.error(e)
    }
    res.redirect('/')
})

app.put('/:id', async(req, res) => {
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
  
  