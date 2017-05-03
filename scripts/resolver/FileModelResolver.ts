import { Dictionary, ViewModelContext } from "ninjagoat";
import { inject, injectable } from "inversify";
import { IModelResolver } from "./IModelResolver";

@injectable()
class FileModelResolver implements IModelResolver {
    constructor( @inject("Models") private models: Dictionary<Dictionary<any>> | Dictionary<any>) { }

    public resolve<T>(context: ViewModelContext): T {
        let model: T;
        let area = this.models[context.area];
        if (!area) model = null;
        else if (!context.viewmodelId || area === "Index" || area === "Master" || area === "NotFound") model = area.default;
        else if (area[context.viewmodelId]) model = area[context.viewmodelId].default;

        return model;
    }
}

export { FileModelResolver };
