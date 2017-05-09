import { injectable } from "inversify";
import { Dictionary, ViewModelContext } from "ninjagoat";
import { IContextRegistry } from "./IContextRegistry";
import { IContextRegistryChecker } from "./IContextRegistryChecker";

@injectable()
class ContextRegistry implements IContextRegistry, IContextRegistryChecker {
    private contexts: Dictionary<boolean> = {};

    public register(context: ViewModelContext): IContextRegistry {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        this.contexts[`${context.area}:${context.viewmodelId}`] = true;
        return this;
    }

    public exists(context: ViewModelContext): boolean {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        return !!this.contexts[`${context.area}:${context.viewmodelId}`];
    }

    private isValidContext(context: ViewModelContext): boolean {
        return context && !!context.area && !!context.viewmodelId;
    }
}

export { ContextRegistry };
