import mongoose from "mongoose";

const reqs = {
    type: String,
    required: true,
}

const prefixScheema = new mongoose.Schema({
    _id: reqs,
    prefix: reqs
});

module.exports = mongoose.model('guild-prefixes', prefixScheema);