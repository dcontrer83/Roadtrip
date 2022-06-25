const express = require('express');
const path = require('path');
const app = express();

//Render anything within the assets folder
app.use(express.static(path.join(__dirname)));

//Display index.html page when user enters the homepage
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
})

//create server at port 3000
app.listen(3000, () => {
    console.log("test");
})