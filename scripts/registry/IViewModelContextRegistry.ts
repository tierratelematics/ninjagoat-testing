import { ViewModelContext } from "ninjagoat";

interface IViewModelContextRegistry {
    register(context: ViewModelContext): IViewModelContextRegistry;
    isRegistered(context: ViewModelContext): boolean;
}

export default IViewModelContextRegistry;