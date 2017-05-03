import { ViewModelContext } from "ninjagoat";
import { CommandEnvelope } from "ninjagoat-commands";

interface ICommandHandler {
    handle(envelope: CommandEnvelope, context: ViewModelContext): void;
}

export { ICommandHandler };
