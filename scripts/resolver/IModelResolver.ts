import { ViewModelContext } from "ninjagoat";

interface IModelResolver {
    resolve<T>(context: ViewModelContext, type?: string): T;
}

export { IModelResolver };
