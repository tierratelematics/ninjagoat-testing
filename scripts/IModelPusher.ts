import { ViewModelContext } from "ninjagoat";

interface IModelPusher {
    pushModel(model: any, context: ViewModelContext): void;
}

export { IModelPusher };
