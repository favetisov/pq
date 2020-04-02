export class ControllerError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
  }
}

export class GuardError extends ControllerError {
  constructor(public message: string, public status: number = 403) {
    super(message);
  }
}
