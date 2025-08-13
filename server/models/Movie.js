import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    title: {type: String, required: true},
    poster_path: {type: String, required: true},
    back_drop_path: {type: String, required: true},
    genres: {type: Array, required: true},
    overview: {type: String, required: true},
    runtime: {type: Number, required: true},
    release_date: {type: String, required: true},
    vote_average: {type: Number, required: true},
    original_language: {type: String},
    tagline: {type: String},
    casts: {type: Array, required: true},
}, {timestamps: true});

const Movie = mongoose.model("Movie", movieSchema);

export default Movie;