const express = require('express');
const path = require('path');
const app = express();
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

console.log(process.env.USERLIST);

process.env.USERLIST = 'WHAT';

console.log(process.env.USERLIST);

//Render all static files folder
app.use(express.static('public'));

//Display index.html page when user enters the homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

//create server at port 3000
app.listen(3000, () => {
    console.log("test");
})