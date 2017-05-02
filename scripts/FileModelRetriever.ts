import { inject, injectable } from "inversify";
import * as Rx from "rx";
import { ViewModelContext, Dictionary } from "ninjagoat";
import { IModelRetriever, ModelRetriever, ModelState } from "ninjagoat-projections";
import { IContextRegistryChecker } from "./registry/IContextRegistryChecker";

@injectable()
class FileModelRetriever implements IModelRetriever {
    private observer: Dictionary<Rx.Observer<any>> = {};

    constructor( @inject("ModelRetriever") private modelRetriever: ModelRetriever,
        @inject("IContextRegistry") private contextRegistryChecker: IContextRegistryChecker,
        @inject("MockFiles") private mockFiles: Dictionary<Dictionary<any>>) { }

    public modelFor<T>(context: ViewModelContext): Rx.Observable<ModelState<T>> {
        if (!this.isValidContext(context)) throw (new Error("Invalid Context"));
        if (!this.contextRegistryChecker.exist(context)) return this.modelRetriever.modelFor<T>(context);

        let model: T;
        let observer = this.observer[`${context.area}:${context.viewmodelId}`] = new Rx.ReplaySubject<ModelState<T>>();
        if (this.mockFiles[context.area] && this.mockFiles[context.area][context.viewmodelId]) model = this.mockFiles[context.area][context.viewmodelId]._;

        Rx.Observable
            .just(ModelState.Loading<T>())
            .delay(Math.floor(Math.random() * 1000) + 1)
            .concat(Rx.Observable.just(model ? ModelState.Ready<T>(model) : ModelState.Failed<T>(null)))
            .subscribe(data => observer.onNext(data));

        return observer;

    }

    private isValidContext(context: ViewModelContext): boolean {
        return context && !!context.area && !!context.viewmodelId;
    }
}

export { FileModelRetriever };
