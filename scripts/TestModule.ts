import { interfaces } from "inversify";
import { IModelRetriever, ModelRetriever } from "ninjagoat-projections";
import { IModule, IViewModelRegistry, IServiceLocator, FeaturePredicates, FeatureToggle } from "ninjagoat";
import { IContextRegistry } from "../scripts/registry/IContextRegistry";
import { IContextRegistryChecker } from "../scripts/registry/IContextRegistryChecker";
import { ContextRegistry } from "../scripts/registry/ContextRegistry";
import { FileModelRetriever } from "../scripts/FileModelRetriever";
import { IModelPusher } from "../scripts/IModelPusher";
import { IModelResolver } from "./resolver/IModelResolver";
import { FileModelResolver } from "./resolver/FileModelResolver";

@FeatureToggle(FeaturePredicates.environment["development"])
class TestModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IContextRegistry | IContextRegistryChecker>("IContextRegistry").to(ContextRegistry).inSingletonScope();
        container.bind<IModelResolver>("IModelResolver").to(FileModelResolver);

        container.unbind("IModelRetriever");
        container.bind<ModelRetriever>("ModelRetriever").to(ModelRetriever).inSingletonScope();
        container.bind<IModelRetriever | IModelPusher>("IModelRetriever").to(FileModelRetriever).inSingletonScope();
    };

    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void { }
}

export default TestModule;
