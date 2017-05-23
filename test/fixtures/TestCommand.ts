import {CommandDecorators as decorators} from "ninjagoat-commands";

@decorators.Endpoint("/testEndpoint")
@decorators.Type("testType")
class TestCommand {
    id: string;
    type: string;

    constructor(id: string, type: string) {
        this.id = id;
        this.type = type;
    }
}

export {TestCommand};
