import axios from "axios";

const instance = axios.create({
  baseURL: "/",
  proxy: {
    host: "localhost",
    port: 3450
  },
});

export default instance;
