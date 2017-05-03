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
        private scheduler: Rx.Scheduler = Rx.Scheduler.default) { }

    public modelFor<T>(context: ViewModelContext): Rx.Observable<ModelState<T>> {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.contextRegistryChecker.exist(context)) return this.modelRetriever.modelFor<T>(context);

        let { area, viewmodelId } = context;
        let model: T = this.modelResolver.resolve<T>(context);
        let subject = this.subjects[`${area}:${viewmodelId}`] = new Rx.Subject<ModelState<T>>();

        Rx.Observable
            .just(ModelState.Loading<T>(), this.scheduler)
            .delay(Math.floor(Math.random() * 1000) + 1, this.scheduler)
            .concat(Rx.Observable.just(model ? ModelState.Ready<T>(model) : ModelState.Failed<T>(null), this.scheduler))
            .subscribe(data => subject.onNext(data));

        return subject.asObservable();
    }

    public pushModel(model: any, context: ViewModelContext): void {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.subjects[`${context.area}:${context.viewmodelId}`]) throw (new Error("Context Not Registered"));

        Rx.Observable
            .just(ModelState.Loading(), this.scheduler)
            .delay(Math.floor(Math.random() * 1000) + 1, this.scheduler)
            .concat(Rx.Observable.just(model ? ModelState.Ready(model) : ModelState.Failed(null), this.scheduler))
            .subscribe(data => this.subjects[`${context.area}:${context.viewmodelId}`].onNext(data));
    }

    private isValidContext(context: ViewModelContext): boolean {
        return context && !!context.area;
    }
}

export { FileModelRetriever };
