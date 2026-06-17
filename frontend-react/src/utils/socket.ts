// DEPRECATED: WebSockets have been replaced by API polling.
// This file is no longer used.
export const socketService = {
  connect: () => ({ on: () => {}, off: () => {} }),
  joinElection: () => {},
  disconnect: () => {},
};
