require("dotenv").config()

//Version 1.0.0 - Liri Bot will check a condition passed into the node app and perform an action, based on the request.
//Use "concert-this" + artist/band to perform a concert search
//Use "spotify-this-song" + song name to perform a music search
//Use "movie-this" + movie title to perform a movie search
//Use "liris-favorites" to let liri perform it's favorite searches.

//*Variable Declarations:
//*userRequest is the type of search requested by the user.
//*entertainment is the variable storing the users content request (with spaces)
//*artist is the variable storing the users content request (with %20 spacing)
//*movietitle is the variable storing the users content request (with + spacing)

var userRequest = process.argv[2],
    entertainment = process.argv[3],
    artist = entertainment,
    movietitle = entertainment,
    log = []

//*Declare constants to require the installed NPMs and keys.js file
const request = require("request"),
      Spotify = require("node-spotify-api"),
      moment = require("moment"),
      dotenv = require("dotenv"),
      safe = require("../liri-node-app/keys.js"),
      fs = require("fs")

//Run through multiple words if any, and add to the content variable.
for ( let i=4; i<process.argv.length; i++ ) {
    entertainment += " " + process.argv[i]
    artist += "%20" + process.argv[i]
    movietitle += "+" + process.argv[i]
}

//!The main functions here; concerts, music, movies; run the api requests.
//!Another function runs the log (logActivity)
//*Concerts is the BandsInTown api function
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
    //*Music is the Spotify API function
    music = function(e) {

        //This variable grabs the ids from the external .js file
        var spotify = new Spotify ({
            id: safe.spotify.id,
            secret: safe.spotify.secret
        })

        //This is the api request
        spotify.search({
            type: "track", 
            query: e,
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

    //*Movies is the OMDB API function
    movies = function(e) {
        if ( process.argv[3] === undefined ) {
            e = "Mr.+Nobody"
        }
        
        //This builds the API Call
        let movieSearch = "http://www.omdbapi.com/?apikey=trilogy&t=" + e,
            options = {
                url: movieSearch,
                method: "GET",
                "content-type": "application/json"
            }
        // This executes the API Call
        request(options, function(err, response, body) {
            
            // If no error, parse the body, push the elements into the log array, and run the log Activity.
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

    //*LogActivity is the function that writes the log.txt file.
    logActivity = function () { 

        //If the user requested a concert, run the concert log.
        if (userRequest === "concert-this") {

            var logConcert = ("\nThe next show is at " + log[0] + ". \nCity: " + log[1]+ ". \nShow Date: " + log[2] + ".\nDate of search: " + moment().format("MM/DD/YYYY") + ".\n")

            // This code snippet appends the user's concert search to the log file.
            fs.appendFile("log.txt", "\nArtist searched: " + entertainment + logConcert, function(err) {

                // If the code experiences any errors it will log the error to the console.
                if (err) {
                  return console.log(err);
                }
                // Otherwise, it will print: "movies.txt was updated!"
                console.log("log.txt was updated!");
              
              });

              log = []
        //If the user requested a Song, run the Spotify Log
        } else if (userRequest === "spotify-this-song") {

            var logSong = ("\nArtist: " + log[0] + ". \nSong: " + log[1]+ ". \nAlbum: " + log[2] + ". \nPreview: " + log[3] + ".\nDate of search: " + moment().format("MM/DD/YYYY") + ".\n")

            // This code snippet appends the user's song search to the log file.
            fs.appendFile("log.txt", "\nSong searched: " + entertainment + logSong, function(err) {

                // If the code experiences any errors it will log the error to the console.
                if (err) {
                  return console.log(err);
                }
                // Otherwise, it will print: "movies.txt was updated!"
                console.log("log.txt was updated!");
              
              });

              log = []

        //if the user requested a movie, run the movie log.
        } else if (userRequest === "movie-this" ) {

            var logMovie = ("\nTitle: " + log[0] + ". \nRelease Year: " + log[1] + ". \nRating: " + log[2] + ". \nRotton Tomatoes Score: " + log[3] + ". \nProduced In: " + log[4] + ". \nLanguage: " + log[5] + ". \nPlot: " + log[6] + ". \nActors: " + log[7] +".\nDate of search: " + moment().format("MM/DD/YYYY") + ".\n")

            // This code snippet appends the user's movie search to the log file.
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

//!This section runs the main condition check on what the user is asking for.
//*This triggers the functions above accordingly.

//*Check the first condition, a search for liris favorites.
if ( userRequest === "liris-favorites") {

    //Read Liri's Favorites from the random.txt file.
    fs.readFile("random.txt", "utf8", function(error, data) {

        if (error) {
          return console.log(error);
        } else {

            //Add a title to the log file with divider.
            fs.appendFile("log.txt", "\nThese are Liri\'s Favorites!\n-----------------------------------\n", function(err) {

                // If the code experiences any errors it will log the error to the console.
                if (err) {
                  return console.log(err);
                }
              
            }); 

            //Grab liri's favorite song from the random.txt file
            setTimeout( function() {

                console.log("\nThis is Liri's Favorite Song\n")
                var getData = data.split(",")
                userRequest = getData[0]
                entertainment = getData[1]

                //Pass the liri's favorite song into the songs search function.
                music(entertainment)

                //Grab liri's favorite artist from the random.txt file
                setTimeout( function() {

                    console.log("\nThis is Liri's Favorite Concert Coming Up\n")
                    var getData = data.split(",")
                    userRequest = getData[2]
                    artist = getData[3]
                    entertainment = artist

                    //Pass the liri's favorite artist into the concerts search function.
                    concerts(artist)

                    //Grab liri's favorite movie from the random.txt file
                    setTimeout( function() {

                        console.log("\nThis is Liri's Favorite Movie\n")
                        var getData = data.split(",")
                        userRequest = getData[4]
                        movietitle = getData[5]
                        entertainment = movietitle

                        //Pass the liri's favorite movie into the movie search function.
                        movies(entertainment)
                        
                        //Add bottom divider to the log file.
                        setTimeout( function() {

                            fs.appendFile("log.txt", "\n-----------------------------------\n", function(err) {

                                // If the code experiences any errors it will log the error to the console.
                                if (err) {
                                  return console.log(err);
                                }
                              
                            });

                        }, 1000)
                        
                    }, 1000)
    
                }, 1000)

            }, 1000)

            
        }
      });

//*Check the second condition, a concert search.
}else if ( userRequest === "concert-this" ) {
    
    //Add a title to the log file with divider.
    fs.appendFile("log.txt", "\nUser Concert Search\n-----------------------------------\n", function(err) {

        // If the code experiences any errors it will log the error to the console.
        if (err) {
          return console.log(err);
        }
      
    });

    //Pass the artist into the concerts search function.
    concerts(artist)
    
    //Add bottom divider to the log file.
    setTimeout( function() {

        fs.appendFile("log.txt", "\n-----------------------------------\n", function(err) {

            // If the code experiences any errors it will log the error to the console.
            if (err) {
              return console.log(err);
            }
          
        });
    },1500)
    

//*Check the third condition, a song search.
} else if ( userRequest === "spotify-this-song" ) {
    
    //Add a title to the log file with divider.
    fs.appendFile("log.txt", "\nUser Song Search\n-----------------------------------\n", function(err) {

        // If the code experiences any errors it will log the error to the console.
        if (err) {
          return console.log(err);
        }
      
    });

    //Pass the entertainment into the songs search function.
    music(entertainment)

    //Add bottom divider to the log file.
    setTimeout( function() {

        fs.appendFile("log.txt", "\n-----------------------------------\n", function(err) {

            // If the code experiences any errors it will log the error to the console.
            if (err) {
              return console.log(err);
            }
          
        });
    },1500)

//*Check the fourth condition, a movie search.
} else if ( userRequest === "movie-this" ) {

    //Add a title to the log file with divider.
    fs.appendFile("log.txt", "\nUser Movie Search\n-----------------------------------\n", function(err) {

        // If the code experiences any errors it will log the error to the console.
        if (err) {
          return console.log(err);
        }
      
    });

    //Pass the movie title into the movie search function.
    movies(movietitle)

    //Add bottom divider to the log file.
    setTimeout( function() {

        fs.appendFile("log.txt", "\n-----------------------------------\n", function(err) {

            // If the code experiences any errors it will log the error to the console.
            if (err) {
              return console.log(err);
            }
          
        });
    },1500)

}
