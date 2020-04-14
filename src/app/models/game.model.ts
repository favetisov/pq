import { AbstractModel } from './abstract.model';

export enum GameState {
  NOT_STARTED,
  IN_PROGRESS,
  FINISHED,
}

export class Game extends AbstractModel {
  _id: string;
  name: string;
  twitchChannel: string;
  youtubeLive: string;
  state: GameState = GameState.NOT_STARTED;
  currentRound = 0;
  currentSubround = 0;
  teams: Array<{
    _id: string;
    name: string;
    code: string;
    rounds: Array<{
      _id: number;
      name: string;
      subrounds: Array<{
        submittedTimestamp: number;
        evaluated: boolean;
        score: number;
        _id: number;
        fields: Array<{ fieldId: number; first: string; second: string; score: number }>;
      }>;
    }>;
  }> = [];
  rounds: Array<{
    _id: number;
    name: string;
    subrounds: Array<{ _id: number; name: string; schema: Array<{ fieldId: number; first: string; second?: string }> }>;
  }> = [];
  broadcast: {
    slides: string[];
    currentSlide: number;
    currentMode: string;
    inProgress: boolean;
    resolvedSlide: string;
  } = { slides: [], currentSlide: 0, currentMode: 'slide', inProgress: false, resolvedSlide: null };

  constructor(model?: Object) {
    super();
    this.map(model || {}, {});
  }
}
