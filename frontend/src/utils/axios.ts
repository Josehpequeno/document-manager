import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3450/api/",
  proxy: {
    host: "localhost",
    port: 3450,
  },
});

export default instance;
