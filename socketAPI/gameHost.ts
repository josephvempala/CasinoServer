import { Server, Socket } from "socket.io";
import { verifySocketUser } from "../utils/authentication";
import RouletteHost from "./rouletteGameHost";

export default function gameHost(io: Server) {
  const roulette = new RouletteHost(io);
  io.on("connection", async (socket: Socket) => {
    await verifySocketUser(socket);
    //Register all game listeners here
    console.log("connected");
    roulette.Listen(socket);
  });
}
