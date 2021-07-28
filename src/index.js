const express = require('express');
const PORT = process.env.PORT || 8000;
const path = require('path')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ // to handle form submissions
    extended: false
}))

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req,res)=>{
    res.send({
        msg: "Testing"
    });
});

app.listen(PORT, ()=>{
    console.log('Running on port',PORT)
})

