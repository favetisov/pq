import * as mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: String,
  currentRound: { type: Number, default: 0 },
  currentSubround: { type: Number, default: 0 },
  state: { type: Number, default: 0 },
  rounds: mongoose.Schema.Types.Mixed,
  teams: mongoose.Schema.Types.Mixed,
});

export const Game = mongoose.model('Game', schema);
