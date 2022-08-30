import mongoose from "mongoose";

const reqs = {
    type: String,
    required: true,
}

const queueScheema = new mongoose.Schema({
    _id: reqs,
    songQueue: [{
        type: Object,
        required: true,
    }]
});

module.exports = mongoose.model('guild-SongQueues', queueScheema);