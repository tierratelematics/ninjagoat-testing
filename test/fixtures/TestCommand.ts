import {CommandDecorators as decorators} from "ninjagoat-commands";

@decorators.Endpoint("/testEndpoint")
@decorators.Type("testType")
class TestCommand {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}

export {TestCommand};
