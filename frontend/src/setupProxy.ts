import { Application, Request, Response } from "express";
const { createProxyMiddleware } = require("http-proxy-middleware");

const setupProxy = (app: Application) => {
  app.use(
    "/**",
    createProxyMiddleware({
      target: "http://localhost:3450/",
      secure: false,
      cookieDomainRewrite: "",
      changeOrigin: true,
      timeout: 5 * 60 * 1000, // 5 minutes
      proxyTimeout: 5 * 60 * 1000, // 5 minutes
      onError: (err: any, req: Request, res: Response) => {
        console.error("Proxy error:", err);
        res.writeHead(500, {
          "Content-Type": "text/plain"
        });
        res.end("Something went wrong. Could not connect to the server.");
      }
    })
  );
};

export default setupProxy;
