import { ViewModelContext } from "ninjagoat";

interface IContextRegistryChecker {
    exists(context: ViewModelContext): boolean;
}

export { IContextRegistryChecker }
