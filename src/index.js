const express = require('express');
const http = require('http');
const PORT = process.env.PORT || 8000;
const path = require('path');
const socketio = require('socket.io');
const needle = require('needle'); // for making http requests to twitter
const config = require('dotenv').config(); // for environment variables
const TOKEN = process.env.TWITTER_BEARER_TOKEN; // authorization token sent as part of header

// endpoints to get stream of tweets based on some filter rules
const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL = "https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id"; // public_metrics gives us stats such as likes, retweets etc. author_id gives us author info
// we get tweet id and text by default. public metrics gives more details like likes,retweets etc. expansions give us author details

const rules = [{value: 'olympics'}] // array that contains all rules added - look for tweets that contain the word giveaway

const app = express();
const server = http.createServer(app); // important steps for socket.io
const io = socketio(server);

app.use(express.json());
app.use(express.urlencoded({ // to handle form submissions
    extended: false 
}))

app.use(express.static(path.join(__dirname, '../public')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, "../public/index.html"));
})

// get stream rules
async function getRules(){
    const response = await needle('get', rulesURL, {
        headers:{
            Authorization: `Bearer ${TOKEN}`
        }
    })
   
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
    return response.body;
}

// delete stream rules - if we remove a filter, we need to delete it from the list of set rules
async function deleteRules(rules){
    if(!Array.isArray(rules.data)){ // ensure rules.data is an array
        return null;
    }
    const ids = rules.data.map((rule)=>rule.id) // map of id to each rule
    // ids is an array of just the ids of rules present 
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

function streamTweets(socket){
    const stream = needle.get(streamURL, {
        headers:{
            Authorization: `Bearer ${TOKEN}`
            }
    })
    // we can now call events on stream
    stream.on('data', (data)=>{ // everytime we get a new tweet
        try{
            const json = JSON.parse(data);
            // console.log(json);
            socket.emit("tweet", json);
        } catch(error){
            // keep the connection open even if there is an error
        }
    })
}


io.on('connection', async()=>{ // whenever a client connects to the server
    console.log('Client connected..');
    let currentRules;
    try{
        currentRules = await getRules();
        await deleteRules(currentRules);
        await setRules();
        
    } catch(error){
        console.log(error);
        process.exit(1);
    }
    streamTweets(io);
})

server.listen(PORT, ()=>{
    console.log("Listening on port", PORT);
})





