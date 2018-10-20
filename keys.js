console.log("keys loaded")

module.exports = {
    spotify: {
        id: process.env.SPOTIFY_ID,
        secret: process.env.SPOTIFY_SECRET
    },
    bandintown: {
        apikey: process.env.BANDKEY
    }   
}