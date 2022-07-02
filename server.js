const express = require('express');
const path = require('path');
const app = express();
const router = express.Router();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

//Locally use 'localHost:3000', however Heroku listens only to whatever is on the Environmental variable PORT
//thus PORT is equal to either the environment PORT OR Local PORT 3000
const PORT = process.env.PORT || 3000;

dotenv.config();

//Render all static files folder
app.use(express.static('public'));

//Enables Express to handle data sent via POST requests as JSON
app.use(bodyParser.json());

//Display index.html page when user enters the homepage
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})

//Creating a POST request for generate route
app.post('/genRoute', (req, res) => {
    let directionService = req.googleAPI;
    console.log(directionService);

    let request = {
        origin: req.origin,
        destination: req.destination,
        travelMode: req.travelMode,
    }
    console.log(request)

    // directionService.route(request, (result, status) => {
    //     if (status == 'OK') {
    //         res.send({
    //             result: result
    //         });
    //     }
    //     else {
    //         console.log(err);
    //     }
    // });
})


//create server at port 3000
//changed 3000 -> PORT.
//depending on the environment (locallly or Heroku), it will create the appropriate PORT.
app.listen(PORT, () => {
    console.log("test");
})