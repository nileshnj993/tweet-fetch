const express = require('express');
const PORT = process.env.PORT || 8000;
const path = require('path')

const needle = require('needle'); // for making http requests to twitter
const config = require('dotenv').config(); // for environment variables
const TOKEN = process.env.TWITTER_BEARER_TOKEN; // authorization token sent as part of header

// endpoints to get stream of tweets based on some filter rules
const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = "https://api.twitter.com/2/tweets/search/stream?tweet.field=public_metrics&expansions=author_id"; // public_metrics gives us stats such as likes, retweets etc. author_id gives us author info

const rules = [{value: 'giveaway'}, {value: 'India' }] // array that contains all rules added - look for tweets that contain the word giveaway
const app = express();

app.use(express.json());
app.use(express.urlencoded({ // to handle form submissions
    extended: false 
}))

app.use(express.static(path.join(__dirname, '../public')));

// get stream rules
async function getRules(){
    const response = await needle('get', rulesURL, {
        headers:{
            Authorization: `Bearer ${TOKEN}`
        }
    })
    console.log(response.body);
    return response.body;
}

// set stream rules
async function setRules(){
    const data = {
        add : rules // array of rules is the data
    }
    const response = await needle('post', rulesURL, data, {
        headers:{
            'content-type': 'application/json', // data type of data variable
            Authorization: `Bearer ${TOKEN}`
        }
    })
}
console.log(rules.data);
// delete stream rules
async function deleteRules(rules){
    if(!Array.isArray(rules.data)){ // ensure rules.data is an array
        return null;
    }
    const ids = rules.data.map((rule)=>rule.id)
       
    const data = {
        delete : {
            ids: ids 
        }
    }
    const response = await needle('post', rulesURL, data, {
        headers:{
            'content-type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
        }
    })
}

    

async function initialize(){ // test function to verify functioning of getRules
    let currentRules;
    try{
        currentRules = await getRules();
        await deleteRules(currentRules);
        await setRules();
        
    } catch(error){
        console.log(error);
        process.exit(1);
    }
}
initialize();


app.get('/', (req,res)=>{
    res.send({
        msg: "Testing"
    });
});

app.listen(PORT, ()=>{
    console.log('Running on port',PORT)
})

