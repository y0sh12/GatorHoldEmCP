import io from "socket.io-client";

let socket = null;
const setSocket = (theSocket) => {
socket = theSocket
};

export {socket, setSocket};