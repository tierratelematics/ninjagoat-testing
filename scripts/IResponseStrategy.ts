import {ViewModelContext} from "ninjagoat";
import {CommandEnvelope} from "ninjagoat-commands";

interface IResponseStrategy {
    getResponseStatus(viewModelContext: ViewModelContext, commandEnvelope: CommandEnvelope ): boolean;
}

export {IResponseStrategy};