const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const machineSchema = new Schema({
  state: {
    type: String,
  },
});

module.exports = mongoose.model('machine', machineSchema);