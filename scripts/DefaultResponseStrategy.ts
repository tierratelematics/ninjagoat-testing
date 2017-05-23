import {inject, injectable} from "inversify";
import {IResponseStrategy} from "./IResponseStrategy";
import {ViewModelContext} from "ninjagoat";
import {CommandEnvelope} from "ninjagoat-commands";


@injectable()
class DefaultResponseStrategy implements IResponseStrategy {

    private counters: {[index: string]: number} = {};

    constructor(@inject("ResponseStrategyNumber") private n: number) { }

    getResponseStatus(viewModelContext: ViewModelContext, commandEnvelope: CommandEnvelope): boolean {
        let index = `${viewModelContext.area}:${viewModelContext.viewmodelId}:${commandEnvelope.payload["type"]}`;
        if (this.counters[index]) {
            this.counters[index]++;
        } else {
            this.counters[index] = 1;
        }

        return !!(this.counters[index] % (this.n + 1));
    }

}

export {DefaultResponseStrategy};
