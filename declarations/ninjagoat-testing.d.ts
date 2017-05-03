import { interfaces } from "inversify";
import { CommandEnvelope } from "ninjagoat-commands";
import { IModelRetriever, ModelState, ModelRetriever } from "ninjagoat-projections";
import { ViewModelContext, Dictionary, IViewModelRegistry, IServiceLocator, IModule } from "ninjagoat";

export interface IContextRegistry {
    register(context: ViewModelContext): IContextRegistry;
}

export interface IContextRegistryChecker {
    exist(context: ViewModelContext): boolean;
}

export interface IModelPusher {
    pushModel(model: any, context: ViewModelContext): void;
}

export interface IModelResolver {
    resolve<T>(context: ViewModelContext): T;
}

export class TestModule implements IModule {
    modules(container: interfaces.Container): void;
    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void;
}

export class ContextRegistry implements IContextRegistry, IContextRegistryChecker {
    public register(context: ViewModelContext): IContextRegistry;
    public exist(context: ViewModelContext): boolean;
}

export class FileModelResolver implements IModelResolver {
    constructor(backend: Dictionary<Dictionary<any>> | Dictionary<any>);

    resolve<T>(context: ViewModelContext): T;
}

export class FileModelRetriever implements IModelRetriever, IModelPusher {
    constructor(modelRetriever: ModelRetriever, contextRegistryChecker: IContextRegistryChecker, modelResolver: IModelResolver, scheduler?: Rx.Scheduler);

    public modelFor<T>(context: ViewModelContext): Rx.Observable<ModelState<T>>;
    public pushModel(model: any, context: ViewModelContext): void;
}
