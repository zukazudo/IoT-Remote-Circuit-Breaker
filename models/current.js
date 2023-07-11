const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const currentSchema = new Schema({
  value: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
    enum: ["short", "normal"],
  },
  date:{
    type: String,
    // default: Date.now(),
  },
});

module.exports = mongoose.model('current', currentSchema);
