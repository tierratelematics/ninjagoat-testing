import { inject, injectable } from "inversify";
import * as Rx from "rx";
import { ViewModelContext, Dictionary } from "ninjagoat";
import { IModelRetriever, ModelRetriever, ModelState } from "ninjagoat-projections";
import { IContextRegistryChecker } from "./registry/IContextRegistryChecker";
import { IModelPusher } from "./IModelPusher";
import { IModelResolver } from "./resolver/IModelResolver";

@injectable()
class FileModelRetriever implements IModelRetriever, IModelPusher {
    private subjects: Dictionary<Rx.Subject<any>> = {};

    constructor( @inject("ModelRetriever") private modelRetriever: ModelRetriever,
        @inject("IContextRegistry") private contextRegistryChecker: IContextRegistryChecker,
        @inject("IModelResolver") private modelResolver: IModelResolver,
        @inject("RxScheduler") private scheduler) { } // The scheduler should be typed as Rx.Scheduler but, until a typings update, this is not possible.

    public modelFor<T>(context: ViewModelContext): Rx.Observable<ModelState<T>> {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.contextRegistryChecker.exists(context)) return this.modelRetriever.modelFor<T>(context);

        this.pushModel(this.modelResolver.resolve<T>(context), context);

        return this.subjects[`${context.area}:${context.viewmodelId}`].asObservable();
    }

    public pushModel(model: any, context: ViewModelContext): void {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.subjects[`${context.area}:${context.viewmodelId}`]) this.subjects[`${context.area}:${context.viewmodelId}`] = new Rx.Subject<ModelState<any>>();

        this.scheduler.schedule('loading', () => this.subjects[`${context.area}:${context.viewmodelId}`].onNext(ModelState.Loading()));
        this.scheduler.scheduleFuture('ready',
            Math.floor(Math.random() * 1000) + 1,
            () => this.subjects[`${context.area}:${context.viewmodelId}`].onNext(model ? ModelState.Ready(model) : ModelState.Failed(null)));
    }

    private isValidContext(context: ViewModelContext): boolean {
        return context && !!context.area;
    }
}

export { FileModelRetriever };
