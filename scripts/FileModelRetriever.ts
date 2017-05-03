import { inject, injectable } from "inversify";
import * as Rx from "rx";
import { CommandEnvelope } from "ninjagoat-commands";
import { ViewModelContext, Dictionary } from "ninjagoat";
import { IModelRetriever, ModelRetriever, ModelState } from "ninjagoat-projections";
import { IContextRegistryChecker } from "./registry/IContextRegistryChecker";
import { ICommandHandler } from "./ICommandHandler";

@injectable()
class FileModelRetriever implements IModelRetriever, ICommandHandler {
    private subjects: Dictionary<Rx.Subject<any>> = {};

    constructor( @inject("ModelRetriever") private modelRetriever: ModelRetriever,
        @inject("IContextRegistry") private contextRegistryChecker: IContextRegistryChecker,
        @inject("MockFiles") private mockFiles: Dictionary<Dictionary<any>>,
        private scheduler?: Rx.Scheduler) { }

    public modelFor<T>(context: ViewModelContext): Rx.Observable<ModelState<T>> {
        let model: T;
        let { area, viewmodelId } = context;
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.contextRegistryChecker.exist(context)) return this.modelRetriever.modelFor<T>(context);
        if (this.mockFiles[area] && this.mockFiles[area][viewmodelId]) model = this.mockFiles[area][viewmodelId]._;
        this.subjects[`${area}:${viewmodelId}`] = new Rx.Subject<ModelState<T>>();

        Rx.Observable
            .just(ModelState.Loading<T>(), this.scheduler || Rx.Scheduler.default)
            .delay(Math.floor(Math.random() * 1000) + 1, this.scheduler || Rx.Scheduler.default)
            .concat(Rx.Observable.just(model ? ModelState.Ready<T>(model) : ModelState.Failed<T>(null), this.scheduler || Rx.Scheduler.default))
            .subscribe(data => this.subjects[`${area}:${viewmodelId}`].onNext(data));

        return this.subjects[`${area}:${viewmodelId}`].asObservable();
    }

    public handle(envelope: CommandEnvelope, context: ViewModelContext): void {
        let model: any;
        let { area, viewmodelId } = context;
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.subjects[`${area}:${viewmodelId}`]) throw (new Error("Context Not Registered"));
        if (this.mockFiles[area] && this.mockFiles[area][viewmodelId]) model = this.mockFiles[area][viewmodelId][envelope.type];

        Rx.Observable
            .just(ModelState.Loading(), this.scheduler || Rx.Scheduler.default)
            .delay(Math.floor(Math.random() * 1000) + 1, this.scheduler || Rx.Scheduler.default)
            .concat(Rx.Observable.just(model ? ModelState.Ready(model) : ModelState.Failed(null), this.scheduler || Rx.Scheduler.default))
            .subscribe(data => this.subjects[`${area}:${viewmodelId}`].onNext(data));
    }

    private isValidContext(context: ViewModelContext): boolean {
        return context && !!context.area && !!context.viewmodelId;
    }
}

export { FileModelRetriever };
