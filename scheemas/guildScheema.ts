import { Schema, model } from "mongoose";

const guildSchema = new Schema({
    guild_id: {
      type: String,
      required: true,
      unique: true,
    },
    prefix: {
      type: String,
      default: '!',
    },
    welcome_image: String,
    welcome_message: String,
    goodbye_image: String,
    goodbye_message: String,
    welcome_channel: String,
    goodbye_channel: String,
    bday: {
      channel: String,
      time: String,
    },
    role_select_channel: String,
});

export default model('Guild', guildSchema);