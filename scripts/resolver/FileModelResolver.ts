import { Dictionary, ViewModelContext } from "ninjagoat";
import { inject, injectable } from "inversify";
import { IModelResolver } from "./IModelResolver";

@injectable()
class FileModelResolver implements IModelResolver {
    constructor( @inject("Backend") private backend: Dictionary<Dictionary<any>> | Dictionary<any>) { }

    public resolve<T>(context: ViewModelContext): T {
        let model: T;
        let area = this.backend[context.area];
        if (!area) model = null;
        else if (!context.viewmodelId || area === "Index" || area === "Master" || area === "NotFound") model = area.__INIT;
        else if (area[context.viewmodelId]) model = area[context.viewmodelId].__INIT;

        return model;
    }
}

export { FileModelResolver };
