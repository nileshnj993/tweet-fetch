const tweetStream = document.getElementById('tweetStream');
const tweets = [];
const loadingGif = document.getElementById("loading");
let loading = false;

const socket = io() // display on browser side

socket.on("connect", () => { // on connection
    console.log("Connected to server..");
})

socket.on("tweet", (tweet)=>{ // on receiving live tweets
    //console.log(tweet);
    loading=true;
    const tweetData = {
        id: tweet.data.id,
        text: tweet.data.text,
        username: `@${tweet.includes.users[0].username}`
    };
    loading = false;
    const tweetElement = document.createElement('div');
    tweetElement.className = 'card my-4';
    tweetElement.innerHTML = `
        <div class="card-body">
            <h5 class="card-title"> ${tweetData.text} </h5>
            <h6 class="card-subtitle mb-2 text-muted"> ${tweetData.username} </h6>
            <a target="_blank" id="btn" class="btn btn-primary mt-3" href="https://twitter.com/${tweetData.username}/status/${tweetData.id}"> 
                <i class="fab fa-twitter"> </i> Go To Tweet
            </a>
        </div>
    `
    tweetStream.appendChild(tweetElement);
    loadingGif.innerHTML = '';
})

