import { Dictionary, ViewModelContext } from "ninjagoat";
import IViewModelContextRegistry from './IViewModelContextRegistry';

class ViewModelContextRegistry implements IViewModelContextRegistry {
    private contexts: Dictionary<boolean> = {};

    public register(context: ViewModelContext): IViewModelContextRegistry {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        this.contexts[`${context.area}:${context.viewmodelId}`] = true;
        return this;
    }

    public isRegistered(context: ViewModelContext): boolean {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        return !!this.contexts[`${context.area}:${context.viewmodelId}`];
    }

    private isValidContext(context: ViewModelContext): boolean {
        return context && !!context.area && !!context.viewmodelId;
    }
}

export default ViewModelContextRegistry;