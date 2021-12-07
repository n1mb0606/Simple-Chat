import io from 'socket.io-client'
const URL = window.location.protocol+'//'+window.location.hostname+':30002' //http://123.123.123.123:3002
const socket = io(URL,{
    	autoConnect: true
});
socket.onAny((event, ...args) => {
    console.log(event, args);
  });
export default socket;
