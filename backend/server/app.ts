import * as bodyParser from "body-parser";
import express from "express";
import * as http from "http";
import config from "../config/config";
import { MiddleWare } from "../core";
import Routes from "../core/router";
import { connectToDatabase } from '../database/db';
import { setupSwagger } from "../swagger";

export default class Server {
  private readonly routes: Routes = new Routes();
  private readonly app: any;

  public static bootstrap(): Server {
    return new Server();
  }

  public constructor() {
    global["config"] = config;
    if (config.syncDb) {
      global["syncDb"] = true;
    }
    this.app = express();
    this.config();
  }

  public async run(port: number, callback?: () => void): Promise<http.Server> {
    if (callback) {
      return this.app.listen(port, callback);
    }

    return this.app.listen(port);
  }
  private async config() {
    /** Register lib middlewares */
    connectToDatabase().then(async () => {
      this.app.use(bodyParser.json({ limit: '10mb' }));
      this.app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
      const middleWare = new MiddleWare();
      this.app.use("/files", express.static("files"));
      setupSwagger(this.app);

      await this.routes.setRoutes();
      /** Register application router */
      this.app.use(middleWare.crosHeaders);
      this.app.use(this.routes.route);
    });
  }
}
