const express = require("express")
const app = express()
const methodOverride= require('method-override');
const cookieParser = require('cookie-parser')
const toDosRouter = require('./routes/todos')
const userRouter = require('./routes/user')

app.use(methodOverride('_method'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(cookieParser('secret'))

app.use(toDosRouter)
app.use(userRouter)


app.listen(process.env.PORT || 3000, () => {
    console.log("Application started and Listening on port 3000");
  })
  