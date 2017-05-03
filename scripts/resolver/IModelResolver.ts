import { ViewModelContext } from "ninjagoat";

interface IModelResolver {
    resolve<T>(context: ViewModelContext): T;
}

export { IModelResolver };
