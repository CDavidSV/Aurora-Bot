import { Schema, model } from "mongoose";

const guildSchema = new Schema({
  _id: String,
  prefix: {
    type: String,
    default: "!",
  },
  welcome: {
    welcome_image: {
      type: String,
      default: null,
    },
    welcome_message: {
      type: String,
      default: null,
    },
    welcome_channel: {
      type: String,
      default: null,
    },
    embed: {
      type: Boolean,
      default: false,
    },
  },
  goodbye: {
    goodbye_image: {
      type: String,
      default: null,
    },
    goodbye_message: {
      type: String,
      default: null,
    },
    goodbye_channel: {
      type: String,
      default: null,
    },
    embed: {
      type: Boolean,
      default: false,
    },
  },
  bday: {
    channel: {
      type: String,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },
  },
  autorole: {
    type: Array,
    default: []
  },
  autonick: {
    type: String,
    default: null
  }
});

export default model('Guild', guildSchema);