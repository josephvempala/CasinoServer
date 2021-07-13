import { Server, Socket } from "socket.io";
import RouletteGameHost from "./rouletteListener";

export default function gameHost(io: Server) {
  const roulette = new RouletteGameHost(io);
  io.on("connection", (socket: Socket) => {
    //Register all game listeners here
    console.log("connected");
    roulette.Listen(socket);
  });
}