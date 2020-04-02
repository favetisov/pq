import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: String,
});

export const Game = mongoose.model('Game', schema);
