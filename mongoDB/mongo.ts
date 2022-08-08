import mongoose from "mongoose";
import config from '../config.json';

export default async function () {
    await mongoose.connect(config.mongoPath);
    return mongoose;
}