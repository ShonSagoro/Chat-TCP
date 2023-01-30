import net from "net";
import { PORT, host } from "./config.js";
import { colors } from "./colors.js";

const sockets = [];
const preference = {};

const server = net.createServer((socket) => {
  sockets.push(socket);

  console.log(socket.remoteAddress);

  if (preference[socket.remoteAddress] === undefined) {
    preference[socket.remoteAddress] = {
      username: socket.remoteAddress,
      color: colors.default,
    };
  }

  console.log(
    colors.green + "new client connected:",
    preference[socket.remoteAddress].username
  );

  socket.on("data", (data) => {
    const array = data.toString().trim().split(" ");
    if (array[1] == undefined) {
      return;
    }
    if (userCommands(array, socket)) {
      return;
    }
    broadcast(data, socket);
  });

  socket.on("error", (err) => {
    console.log(colors.red,"A client has disconnected.");
  });

  socket.on("close", () => {
    console.log(colors.default,"A client has left the chat.");
  });
});

const broadcast = (message, socketSent) => {
  if (
    preference[socketSent.remoteAddress].username == socketSent.remoteAddress
  ) {
    let array = message.toString().trim().split(" ", 1);
    let name = array[0].replace(":", "");
    preference[socketSent.remoteAddress].username = name;
  }
  if (message === "quit") {
    const index = sockets.indexOf(socketSent);
    sockets.splice(index, 1);
  } else {
    sockets.forEach((socket) => {
      let messageFinal = `${preference[socketSent.remoteAddress].color}${message
        .toString()
        .trim()}`;
      if (socket !== socketSent) socket.write(messageFinal);
    });
  }
};

const userCommands = (commands, socket) => {
  switch (commands[1]) {
    case "-lc":
      showListColor(socket);
      return true;
    case "-c":
      changeColor(commands[2], socket);
      return true;
    case "-help":
      socket.write(
        `\ncommands: \n-q: quit the server \n-h: show this, all commands`
      );
      return true;
    default:
      return false;
  }
};

const showListColor = (socket) => {
  socket.write("List of colors: ");
  Object.keys(colors).forEach((x) => {
    socket.write("\n" + x);
  });
};

const changeColor = (color, socket) => {
  let array = Object.entries(colors).filter(
    (c) => c[0] == color.toLowerCase().trim()
  );
  if (color !== undefined) {
    let colorChange = array[0][1];
    preference[socket.remoteAddress].color = colorChange;
  }
};

const serverCommands = (raw) => {
  let command = raw.toString().trim().split(" ");

  if (command[0] == "-l") {
    console.table(preference);
  } else {
    console.log("no command");
  }
};

server.on("listening", () => {
  process.stdin.on("data", (data) => {
    serverCommands(data);
  });
});

server.listen(PORT, host, () => {
  console.log("Servidor activo en el puerto:", PORT, host);
});
