let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: "*", // Adjust for production
        methods: ["GET", "POST"]
      }
    });

    console.log("Socket.io initialized.");

    io.on("connection", (socket) => {
      console.log("Client connected via socket:", socket.id);

      socket.on("join_election", (electionId) => {
        // Rooms can be used to isolate realtime updates per election
        socket.join(`election_${electionId}`);
        console.log(`Socket ${socket.id} joined election room: ${electionId}`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
