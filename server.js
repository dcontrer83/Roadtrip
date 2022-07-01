const express = require('express');
const path = require('path');
const app = express();
const router = express.Router();
const dotenv = require('dotenv');

//Locally use 'localHost:3000', however Heroku listens only to whatever is on the Environmental variable PORT
//thus PORT is equal to either the environment PORT OR Local PORT 3000
const PORT = process.env.PORT || 3000;

dotenv.config();

//Render all static files folder
app.use(express.static('public'));


//create server at port 3000
//changed 3000 -> PORT.
//depending on the environment (locallly or Heroku), it will create the appropriate PORT.
app.listen(PORT, () => {
    console.log("test");
})