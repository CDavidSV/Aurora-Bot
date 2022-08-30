import mongoose from "mongoose";
import config from '../config.json';

export default {
    connect() {
        mongoose.connect(config.mongoPath);
        console.log('Successfully connected to mongo');
    },
}
