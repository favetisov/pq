import { AbstractModel } from './abstract.model';

export enum GameState {
  NOT_STARTED,
  IN_PROGRESS,
  FINISHED,
}

export class Game extends AbstractModel {
  _id: string;
  name: string;
  state: GameState = GameState.NOT_STARTED;
  currentRound = 0;
  teams: Array<{
    _id: string;
    name: string;
    code: string;
    rounds: Array<{
      _id: number;
      name: string;
      submittedTimestamp: number;
      evaluated: boolean;
      score: number;
      fields: Array<{ fieldId: number; first: string; second: string; score: number }>;
    }>;
  }> = [];
  rounds: Array<{
    _id: number;
    name: string;
    schema: Array<{ fieldId: number; first: string; second?: string }>;
  }> = [];

  constructor(model?: Object) {
    super();
    this.map(model || {}, {});
  }
}
