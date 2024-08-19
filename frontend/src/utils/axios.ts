import axios from "axios";

const localIP = process.env.REACT_APP_LOCAL_IP || window.REACT_APP_LOCAL_IP;

let instance = axios.create({
  baseURL: `http://localhost:3450/api/`,
  proxy: {
    host: "localhost",
    port: 3450,
    protocol: "http",
  },
});

if (localIP) {
  instance = axios.create({
    baseURL: `http://${localIP}:3450/api/`,
    proxy: {
      host: localIP,
      port: 3450,
      protocol: "http",
    },
  });
}
export default instance;
