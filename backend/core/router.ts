import { Router } from "express";
import * as fs from "fs";
import * as path from "path";
import { route } from "../__types";
import { MiddleWare } from "./";
export default class Routes {
  // Set type as Router if need to get auto compelete from vscode
  private readonly routes: Router = Router();
  // private middleWare: MiddleWare = ;

  public async setRoutes() {
    const middleWare = new MiddleWare();
    fs.readdirSync(path.join(__dirname, "../components"), {
      withFileTypes: true,
    }).forEach((dir_o) => {
      // Reading routes Dir and filtering only route.ts files
      if (dir_o.isDirectory()) {
        const dir = dir_o.name;
        fs.readdirSync(path.join(__dirname, "../components/" + dir))
          .filter((file: string) => file == "route.ts" || file == "route.js")
          .forEach((routeFile: string) => {
            // Dynamicly Importing routes and setting them in private or public routers
            import(
              "../components/" +
                dir +
                "/" +
                routeFile.replace(".ts", "").replace(".js", "")
            ).then((mode: { default: route[] }) => {
              mode.default.forEach((route) => {
                this.setRoute(route, middleWare);
              });
            });
          });
        fs.readdirSync(path.join(__dirname, "../components/" + dir))
          .filter(
            (file: string) =>
              file.indexOf(".ts") === -1 && file.indexOf(".js") === -1
          )
          .forEach((childDir: string) => {
            // Dynamicly Importing routes and setting them in private or public routers
            fs.readdirSync(
              path.join(__dirname, "../components/" + dir + "/" + childDir)
            )
              .filter(
                (file: string) => file == "route.ts" || file == "route.js"
              )
              .forEach((routeFile: string) => {
                // Dynamicly Importing routes and setting them in private or public routers
                import(
                  "../components/" +
                    dir +
                    "/" +
                    childDir +
                    "/" +
                    routeFile.replace(".ts", "").replace(".js", "")
                ).then((mode: { default: route[] }) => {
                  mode.default.forEach((route) => {
                    this.setRoute(route, middleWare);
                  });
                });
              });
          });
      }
    });
  }

  private setRoute(route: route, middleWare): void {
    const args = [] as any;
    if (route.path) {
      args.push("/api/" + route.path);
    }
    if (route.private) {
      args.push(middleWare.TokenValidator);
    }
    if (route.permission && route.perm_component) {
      args.push(middleWare.permission(route.perm_component, route.permission));
    }
    if (route.uploader) {
      args.push(route.uploader);
    }
    if (route.validationSchema) {
      args.push(middleWare.validateRequest(route.validationSchema));
    }
    if (route.function) {
      args.push(route.function);
    }
    this.routes[route.method](...args);
  }

  get route() {
    return this.routes;
  }
}
