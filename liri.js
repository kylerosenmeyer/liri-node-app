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
    movietitle = entertainment,
    log = []

const request = require("request"),
      Spotify = require("node-spotify-api"),
      moment = require("moment"),
      dotenv = require("dotenv"),
      safe = require("../liri-node-app/keys.js"),
      fs = require("fs")

//Run through multiple words if any add to the content variable.
for ( let i=4; i<process.argv.length; i++ ) {
    entertainment += " " + process.argv[i]
    artist += "%20" + process.argv[i]
    movietitle += "+" + process.argv[i]
}

var concerts = function() {
        var band = {
            apikey: safe.bandintown.apikey
        }
        //Build the information for the band search. This includes the url, the method, and the type.
        let bandSearch = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=" + band.apikey + "&date=upcoming",
            options = {
                url: bandSearch,
                method: "GET",
                "content-type": "application/json"
            }
        // console.log("this is the bandSearch: " + bandSearch)
            
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
                    log.push(nextConcert[0].venue.name, nextConcert[0].venue.city, formattedDate)
                    logActivity()
                }
            })
        },
    music = function() {
        //This variable grabs the ids from the external .js file
        var spotify = new Spotify ({
            id: safe.spotify.id,
            secret: safe.spotify.secret
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
                log.push(data.tracks.items[0].artists[0].name, data.tracks.items[0].name, data.tracks.items[0].album.name, data.tracks.items[0].preview_url)
                logActivity()
            }
        })
        },
    movies = function() {
        if ( process.argv[3] === undefined ) {
            movietitle = "Mr.+Nobody"
        }
    
        let movieSearch = "http://www.omdbapi.com/?apikey=trilogy&t=" + movietitle,
            options = {
                url: movieSearch,
                method: "GET",
                "content-type": "application/json"
            }
        
        request(options, function(err, response, body) {
            
            if (err) {
                return console.log("Houston, we have a problem: " + err)
            } else {
                var movie = JSON.parse(body)
                console.log("\nTitle: " + movie.Title)
                console.log("Release Year: " + movie.Year)
                console.log("Rating: " + movie.Rated)
                console.log("Rotten Tomatoes Score: " + movie.Ratings[1].Value)
                console.log("Produced in: " + movie.Country)
                console.log("Language: " + movie.Language)
                console.log("Plot: " + movie.Plot)
                console.log("Actors: " + movie.Actors + "\n")
                log.push(movie.Title, movie.Year, movie.Rated, movie.Ratings[1].Value, movie.Country, movie.Language, movie.Plot, movie.Actors)
                logActivity()
            }
        })
    },
    logActivity = function () {

        if (userRequest === "concert-this") {

            var logConcert = ("\nThe next show is at " + log[0] + ". \nin " + log[1]+ ". \non " + log[2] + ".\n")

            fs.appendFile("log.txt", "\nArtist searched: " + entertainment + logConcert, function(err) {

                // If the code experiences any errors it will log the error to the console.
                if (err) {
                  return console.log(err);
                }
                // Otherwise, it will print: "movies.txt was updated!"
                console.log("log.txt was updated!");
              
              });

              log = []
        } else if (userRequest === "spotify-this-song") {

            var logSong = ("\nArtist: " + log[0] + ". \nSong: " + log[1]+ ". \nAlbum: " + log[2] + ". \nPreview: " + log[3] + ".\n")

            fs.appendFile("log.txt", "\nSong searched: " + entertainment + logSong, function(err) {

                // If the code experiences any errors it will log the error to the console.
                if (err) {
                  return console.log(err);
                }
                // Otherwise, it will print: "movies.txt was updated!"
                console.log("log.txt was updated!");
              
              });

              log = []
        } else if (userRequest === "movie-this" ) {
            var logMovie = ("\nTitle: " + log[0] + ". \nRelease Year: " + log[1] + ". \nRating: " + log[2] + ". \nRotton Tomatoes Score: " + log[3] + ". \nProduced In: " + log[4] + ". \nLanguage: " + log[5] + ". \nPlot: " + log[6] + ". \nActors: " + log[7] +".\n")
            fs.appendFile("log.txt", "\nMovie searched: " + entertainment + logMovie, function(err) {

                // If the code experiences any errors it will log the error to the console.
                if (err) {
                  return console.log(err);
                }
                // Otherwise, it will print: "movies.txt was updated!"
                console.log("log.txt was updated!");
              
              });
        }
        
    }

// console.log("This is the entertainment: " + entertainment)
//Check the first condition, a concert search.
if ( userRequest === "do-what-it-says") {
    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
          return console.log(error);
        } else {

            setTimeout( function() {

                console.log("\nThis is Liri's Favorite Song")
                var getData = data.split(",")
                userRequest = getData[0]
                entertainment = getData[1]
                // console.log(entertainment)
                music()

            }, 1000)

            setTimeout( function() {

                console.log("\nThis is Liri's Favorite Concert Coming Up")
                var getData = data.split(",")
                userRequest = getData[2]
                artist = getData[3]
                entertainment = artist
                console.log(artist)
                concerts()

            }, 2000)

            setTimeout( function() {

                console.log("\nThis is Liri's Favorite Movie")
                var getData = data.split(",")
                userRequest = getData[4]
                movietitle = getData[5]
                entertianment = movietitle
                // console.log(movietitle)
                movies()

            }, 3000)
            
        }
        
        
     
      });
}else if ( userRequest === "concert-this" ) {

    concerts()

//Check the second condition, a song search.
} else if ( userRequest === "spotify-this-song" ) {
    
    music()

//Check the third condition, a movie search.
} else if ( userRequest === "movie-this" ) {

   movies()
}
