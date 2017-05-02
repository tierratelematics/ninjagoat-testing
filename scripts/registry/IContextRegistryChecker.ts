import { ViewModelContext } from "ninjagoat";

interface IContextRegistryChecker {
    exist(context: ViewModelContext): boolean;
}

export { IContextRegistryChecker }
