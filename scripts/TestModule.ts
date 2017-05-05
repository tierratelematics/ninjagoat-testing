import { interfaces } from "inversify";
import { IModelRetriever, ModelRetriever } from "ninjagoat-projections";
import { IModule, IViewModelRegistry, IServiceLocator, FeaturePredicates, FeatureToggle } from "ninjagoat";
import { IContextRegistry } from "./registry/IContextRegistry";
import { IContextRegistryChecker } from "./registry/IContextRegistryChecker";
import { ContextRegistry } from "./registry/ContextRegistry";
import { FileModelRetriever } from "./FileModelRetriever";
import { IModelPusher } from "./IModelPusher";
import { IModelResolver } from "./resolver/IModelResolver";
import { FileModelResolver } from "./resolver/FileModelResolver";
import { TestCommandDispatcher } from "./TestCommandDispatcher";
import { CommandDispatcher, CommandDispatcherEnricher, PostCommandDispatcher, ICommandDispatcher } from "ninjagoat-commands";
import IContextProvider from "./IContextProvider";
import CurrentContextProvider from "./CurrentContextProvider";
import ILocationProvider from "./ILocationProvider";
import {LocationProvider} from "./LocationProvider";
import {IResponseStrategy} from "./IResponseStrategy";
import {DefaultResponseStrategy} from "./DefaultResponseStrategy";


@FeatureToggle(FeaturePredicates.environment["development"])
class TestModule implements IModule {

    modules = (container: interfaces.Container) => {
        container.bind<IContextRegistry | IContextRegistryChecker>("IContextRegistry").to(ContextRegistry).inSingletonScope();
        container.bind<IModelResolver>("IModelResolver").to(FileModelResolver);

        container.unbind("IModelRetriever");
        container.bind<ModelRetriever>("ModelRetriever").to(ModelRetriever).inSingletonScope();
        container.bind<IModelRetriever | IModelPusher>("IModelRetriever").to(FileModelRetriever).inSingletonScope();

        container.bind<ILocationProvider>("ILocationProvider").to(LocationProvider).inSingletonScope();
        container.bind<IContextProvider>("IContextProvider").to(CurrentContextProvider).inSingletonScope();
        container.bind<IResponseStrategy>("IResponseStrategy").to(DefaultResponseStrategy).inSingletonScope();

        container.unbind("CommandDispatcher");
        container.bind<CommandDispatcher>("CommandDispatcher").to(TestCommandDispatcher).inSingletonScope().whenInjectedInto(CommandDispatcherEnricher);
        container.bind<CommandDispatcher>("PostCommandDispatcher").to(PostCommandDispatcher).inSingletonScope();
    };

    register(registry: IViewModelRegistry, serviceLocator?: IServiceLocator, overrides?: any): void {
        let commandDispatcher = <CommandDispatcher> serviceLocator.get("ICommandDispatcher");
        let postCommandDispatcher = <CommandDispatcher> serviceLocator.get("PostCommandDispatcher");
        commandDispatcher.setNext(postCommandDispatcher);
    }
}

export default TestModule;
