import { ViewModelContext } from "ninjagoat";

export interface IViewModelContextRegistry {
    register(context: ViewModelContext): IViewModelContextRegistry;
    isRegistered(context: ViewModelContext): boolean;
}