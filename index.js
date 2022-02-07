const express = require('express');
const app = express();
const cors = require('cors');


// settings
app.set('port', process.env.PORT || 3000);

// middlewares
app.use(express.json());

// Cors
app.use(cors());

// routes
app.use('/api', require('./routes/index'));


// starting the server 
app.listen(app.get('port'), () => {
  console.log(`Example app listening on port ${app.get('port')}`);
});