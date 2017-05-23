import {CommandDispatcher, CommandEnvelope, CommandResponse} from "ninjagoat-commands";
import {IDateRetriever, IGUIDGenerator, ViewModelContext} from "ninjagoat";
import {inject, injectable} from "inversify";
import {IModelPusher} from "./IModelPusher";
import {IContextRegistryChecker} from "./registry/IContextRegistryChecker";
import {IModelResolver} from "../declarations/ninjagoat-testing";
import {IResponseStrategy} from "./IResponseStrategy";
import IContextProvider from "./IContextProvider";


@injectable()
class TestCommandDispatcher extends CommandDispatcher {

    private viewModelContext: ViewModelContext;

    constructor(@inject("IDateRetriever") dateRetriever: IDateRetriever,
                @inject("IGUIDGenerator") guidGenerator: IGUIDGenerator,
                @inject("IContextProvider") private contextProvider: IContextProvider,
                @inject("IContextRegistry") private contextRegistryChecker: IContextRegistryChecker,
                @inject("IModelRetriever") private modelPusher: IModelPusher,
                @inject("IModelResolver") private fileModelResolver: IModelResolver,
                @inject("IResponseStrategy") private responseStrategy: IResponseStrategy) {
        super(dateRetriever, guidGenerator);
    }

    canExecuteCommand(command: Object): boolean {
        this.viewModelContext = this.contextProvider.getContext();
        return this.contextRegistryChecker.exists(this.viewModelContext);
    }

    executeCommand(envelope: CommandEnvelope): Promise<CommandResponse> {
        if (this.responseStrategy.getResponseStatus(this.viewModelContext, envelope)) {
            let model = this.fileModelResolver.resolve(this.viewModelContext, envelope.payload["type"]);
            this.modelPusher.pushModel(model, this.viewModelContext);
            return Promise.resolve({
                response: {
                    status: 200,
                    message: "Command processed",
                    errors: [],
                    errorCount: 0
                }
            });
        }

        return Promise.reject({
            response: {
                status: 400,
                message: "Invalid command",
                reason: "Test.failure",
                errors: [
                    {
                        codes: [
                            "error.test"
                        ],
                        arguments: null,
                        defaultMessage: "Test failure default message",
                        objectName: "test.object",
                        code: "error.test"
                    },
                ],
                errorCount: 1
            }
        });
    }
}

export {TestCommandDispatcher};