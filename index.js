const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express()
const port = 3000
const router = require('./routers/users');

app.use(express.json());

app.use(cors());
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.use('/api',router);

app.listen(port, () => {
 console.log(`Example app listening on port ${port}`)
})