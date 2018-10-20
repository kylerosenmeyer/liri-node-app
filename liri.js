require("dotenv").config()

//Version 1.0.0 - Liri Bot will check a condition passed into the node app and perform an action, based on the request.
//Use "concert-this" + artist/band to perform a concert search
//Use "spotify-this-song" + song name to perform a music search
//Use "movie-this" + movie title to perform a movie search
//Use "do what it says" to let liri perform a search of it's choice.

//Declare a variable for the userRequest type and the content of the userRequest,
//Also Declare constanst to require the installed NPMs
var userRequest = process.argv[2],
    entertainment = process.argv[3],
    artist = entertainment,
    movie = entertainment

const request = require("request"),
      Spotify = require("node-spotify-api"),
      moment = require("moment"),
      dotenv = require("dotenv"),
      spotSafe = require("../liri-node-app/keys.js")

//Run through multiple words if any add to the content variable.
for ( let i=4; i<process.argv.length; i++ ) {
    entertainment += " " + process.argv[i]
    artist += "%20" + process.argv[i]
    movie += "+" + process.argv[i]
}

console.log("This is the entertainment: " + entertainment)
//Check the first condition, a concert search.
if ( userRequest === "concert-this" ) {

    //Build the information for the band search. This includes the url, the method, and the type.
    var bandSearch = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp&date=upcoming",
        options = {
            url: bandSearch,
            method: "GET",
            "content-type": "application/json"
        }
    console.log("this is the bandSearch: " + bandSearch)
    
    //This is the API request
    request(options, function(error, response, body) {

        if (error) {
            console.log(error)
        } else if ( (!error) && (response.statusCode === 200) ) {

            //This is the return
            var nextConcert = JSON.parse(body),
                date = nextConcert[0].datetime 
                formattedDate = moment(date).format("MM/DD/YYYY")

            //This is the print instructions to the console.
            console.log("\nThe next show is at " + nextConcert[0].venue.name + ",")
            console.log("in " + nextConcert[0].venue.city + ",")
            console.log("on " + formattedDate + ".\n")
        }
    })

//Check the second condition, a song search.
} else if ( userRequest === "spotify-this-song" ) {
    
    //This variable grabs the ids from the external .js file
    var spotify = new Spotify ({
        id: spotSafe.id,
        secret: spotSafe.secret
    })

    //This is the api request
    spotify.search({
        type: "track", 
        query: entertainment,
        limit: "1" 
    }, function(err, data) {

        //This is the return
        if (err) {
            return console.log("Houston, we have a problem: " + err)
        } else {

            //This is the print instruction to the console.
            // console.log(JSON.stringify(data, null, 2))
            console.log("\nArtist: " + data.tracks.items[0].artists[0].name + ".")
            console.log("Song: " + data.tracks.items[0].name + ".")
            console.log("Album: " + data.tracks.items[0].album.name + ".")
            console.log("Preview: " + data.tracks.items[0].preview_url + "\n")
        }
    })

//Check the third condition, a movie search.
} else if ( userRequest === "movie-this" ) {

    var movieSearch = "http://img.omdbapi.com/?apikey=trilogy&" + movie
    
    request(movieSearch, function(err, response) {
        
        if (err) {
            return console.log("Houston, we have a problem: " + err)
        } else {
            console.log(JSON.parse(response))
            console.log("\nTitle: " + response)
        }
    })
}
