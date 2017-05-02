import { ViewModelContext } from "ninjagoat";

export interface IContextRegistry {
    register(context: ViewModelContext): IContextRegistry;
}

export interface IContextRegistryChecker {
    exist(context: ViewModelContext): boolean;
}