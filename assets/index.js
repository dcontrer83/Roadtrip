const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../../Roadtrip' });
})

app.listen(3000, () => {
    console.log("test");
})