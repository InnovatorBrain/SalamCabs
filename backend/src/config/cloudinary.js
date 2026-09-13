const cloudinary = require('cloudinary').v2

// The SDK automatically reads CLOUDINARY_URL (cloudinary://<key>:<secret>@<cloud_name>)
// from the environment — we just need to make sure dotenv has already run
// (it has, since this is only required after server.js loads it) and force
// https URLs for every asset this app generates.
cloudinary.config({ secure: true })

module.exports = cloudinary
