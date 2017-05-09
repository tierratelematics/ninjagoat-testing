import { interfaces } from "inversify";
import { CommandEnvelope } from "ninjagoat-commands";
import { ViewModelContext, IViewModelRegistry, IServiceLocator, IModule } from "ninjagoat";

export interface IContextRegistry {
    register(context: ViewModelContext): IContextRegistry;
}

export interface IContextRegistryChecker {
    exists(context: ViewModelContext): boolean;
}

export interface IModelPusher {
    pushModel(model: any, context: ViewModelContext): void;
}

export interface IModelResolver {
    resolve<T>(context: ViewModelContext, type?: string): T;
}

export interface IContextProvider {
    getContext(): ViewModelContext;
}

export interface ILocationProvider {
    getLocation(): Location;
}

export interface IResponseStrategy {
    getResponseStatus(viewModelContext: ViewModelContext, commandEnvelope: CommandEnvelope ): boolean;
}

export class TestModule implements IModule {
    modules(container: interfaces.Container): void;
    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}
