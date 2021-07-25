import { Server, Socket } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";
import crypto from "crypto";

interface RouletteEmitEvents extends EventsMap {
  RouletteInitialState: (InitialState: InitialState) => void;
  RouletteStart: (newInitialState: GameState) => void;
  RouletteEnd: (result: GameState) => void;
  RouletteBet: (userBet: UserBet) => void;
}

interface InitialState {
  currentGameState: GameState;
  bets: UserBet[];
  history: number[];
}

interface RouletteListenEvents extends EventsMap {
  RouletteBet: (amount: number, betColour: string) => void;
}

interface UserBet {
  id: string;
  username: string;
  betColour: string;
  betAmount: number;
  profilePic: string;
}

interface GameState {
  hash: string;
  salt?: string;
  result?: number;
}

export default class RouletteGameHost {
  private currentState: GameState;
  private previousState: GameState;
  private shouldRun = true;
  private history: number[];
  private bets: UserBet[];
  private totalPool: number;
  private isRunning = false;

  constructor(private io: Server<RouletteListenEvents, RouletteEmitEvents>) {
    this.totalPool = 0;
    this.bets = [];
    this.history = [];
    this.previousState = {} as any;
    this.currentState = {} as any;
    this.StartGame();
  }

  private async StartGame() {
    while (this.shouldRun) {
      await this.GameStart();
      await this.GameEnd();
    }
  }

  private generateNewGame() {
    const salt = crypto.randomBytes(32).toString("base64");
    const result = (crypto.randomInt(10000000) / 10000000) * 14;
    const toHash = salt.concat(result.toString());
    const hash = crypto.createHash("sha256").update(toHash).digest("hex");
    return {
      salt,
      result,
      hash,
    };
  }

  public Listen(socket: Socket<RouletteListenEvents, RouletteEmitEvents>) {
    socket.emit("RouletteInitialState", {
      currentGameState: this.isRunning ? {hash: this.previousState.hash} : this.currentState,
      history: this.history,
      bets: this.bets,
    });
    socket.on("RouletteBet", (amount: number, betColour: string) => {
      const userBet = {
        id: socket.data.user._id,
        username: socket.data.user.username,
        betColour: betColour,
        betAmount: amount,
        profilePic: "",
      };
      this.bets.push(userBet);
      this.totalPool += amount;
      socket.emit("RouletteBet", userBet);
    });
  }

  private GameStart() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        this.isRunning = true;
        this.currentState = this.generateNewGame();
        this.totalPool = 0;
        this.bets = [];
        this.io.emit("RouletteStart", { hash: this.currentState.hash });
        return resolve();
      }, 15000);
    });
  }

  private GameEnd() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        this.io.emit("RouletteEnd", this.currentState);
        this.history.push(this.currentState.result!);
        if (this.history.length > 10)
          this.history = this.history.slice(
            this.history.length - 10,
            this.history.length
          );
        this.previousState = this.currentState;
        this.isRunning = false;
        return resolve();
      }, 25000);
    });
  }
}
