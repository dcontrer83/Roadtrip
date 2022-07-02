const express = require('express');
const path = require('path');
const app = express();
const router = express.Router();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const axios = require('axios');

dotenv.config();

const key = process.env.KEY;

//Locally use 'localHost:3000', however Heroku listens only to whatever is on the Environmental variable PORT
//thus PORT is equal to either the environment PORT OR Local PORT 3000
const PORT = process.env.PORT || 3000;

//Render all static files folder
app.use(express.static('public'));

//Intializes the body-parser plugin
app.use(bodyParser.json());

//Display index.html page when user enters the homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

//Creating a POST request for generate route
app.post('/genRoute', async (req, res) => {
    let origin = req.body.origin;
    let destination = req.body.destination;
    let travelMode = req.body.travelMode;

    let url = `https://maps.googleapis.com/maps/api/directions/json?destination=${destination}&origin=${origin}&mode=${travelMode}&key=${key}`;

    try {
        const { data } = await axios.get(url);
        res.status(200).send(data);
    } catch (err) {
        console.log(err);
    }
})

//create server at port 3000
//changed 3000 -> PORT.
//depending on the environment (locallly or Heroku), it will create the appropriate PORT.
app.listen(PORT, () => {
    console.log("test");
})