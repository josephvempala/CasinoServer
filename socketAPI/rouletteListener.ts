import { Server, Socket } from "socket.io";
import { EventsMap } from "socket.io/dist/typed-events";
import jwt from "jsonwebtoken";
import crypto from "crypto";

interface RouletteEmitEvents extends EventsMap {
  RouletteInitialState: (currentState: RouletteGameState) => void;
  RouletteStart: (newInitialState: RouletteGameState) => void;
  RouletteEnd: (result: RouletteGameState) => void;
}

interface RouletteListenEvents extends EventsMap {
  RouletteBet: (amount: number) => void;
}

interface RouletteGameState {
  hash: string;
  salt?: string;
  result?: number;
}

export default class RouletteGameHost {
  private currentState: RouletteGameState;
  private shouldRun = true;

  constructor(private io: Server<RouletteListenEvents, RouletteEmitEvents>) {
    this.currentState = this.generateNewGame();
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
    socket.emit("RouletteInitialState", { hash: this.currentState.hash });
    socket.on("RouletteBet", (amount: number) => {
      socket.data.jwt = jwt.verify(
        socket.handshake.auth.token,
        process.env.SECRETKEY!
      );
    });
    socket.on("test", () => {
      socket.emit("test");
    });
  }

  private GameStart() {
    return new Promise<void>(() => {
      setTimeout(() => {
        this.io.emit("RouletteStart", { hash: this.currentState.hash });
      }, 15000);
    });
  }

  private GameEnd() {
    return new Promise<void>(() => {
      setTimeout(() => {
        this.io.emit("RouletteEnd", this.currentState);
        this.currentState = this.generateNewGame();
      }, 25000);
    });
  }
}