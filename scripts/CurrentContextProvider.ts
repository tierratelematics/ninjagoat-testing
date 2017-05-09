import {inject, injectable} from "inversify";
import ILocationProvider from "./ILocationProvider";
import {ViewModelContext, IUriResolver} from "ninjagoat";
import IContextProvider from "./IContextProvider";

@injectable()
class CurrentContextProvider implements IContextProvider {

    constructor(@inject("ILocationProvider") private locationProvider: ILocationProvider,
                @inject("IUriResolver") private uriResolver: IUriResolver) {
    }

    getContext(): ViewModelContext {
        let context = this.uriResolver.resolve(this.locationProvider.getLocation().pathname);
        return new ViewModelContext(context.area, context.viewmodel.id);
    }
}

export default CurrentContextProvider;