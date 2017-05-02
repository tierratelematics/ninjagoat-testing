import { ViewModelContext } from "ninjagoat";

interface IContextRegistry {
    register(context: ViewModelContext): IContextRegistry;
}

export { IContextRegistry }
