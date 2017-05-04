import { Dictionary, ViewModelContext } from "ninjagoat";
import { inject, injectable } from "inversify";
import { IModelResolver } from "./IModelResolver";

@injectable()
class FileModelResolver implements IModelResolver {
    constructor( @inject("Models") private models: Dictionary<Dictionary<any>> | Dictionary<any>) { }

    public resolve<T>(context: ViewModelContext, type = "default"): T {
        let model: T = null;
        let area = this.models[context.area];

        if (!area) model = null;
        else if (!context.viewmodelId || area === "Index" || area === "Master" || area === "NotFound") model = area[type] || null;
        else if (area[context.viewmodelId]) model = area[context.viewmodelId][type] || null;

        return model;
    }
}

export { FileModelResolver };
