import expect = require("expect.js");
import {IMock, Mock, It, Times} from "typemoq";
import {ICommandDispatcher} from "ninjagoat-commands";
import {ViewModelContext, IDateRetriever, IGUIDGenerator} from "ninjagoat";
import metadata = Reflect.metadata;
import {IContextRegistryChecker} from "../scripts/registry/IContextRegistryChecker";
import {IModelPusher} from "../scripts/IModelPusher";
import {TestCommandDispatcher} from "../scripts/TestCommandDispatcher";
import {IModelResolver} from "../scripts/resolver/IModelResolver";
import {TestCommand} from "./fixtures/TestCommand";
import {IResponseStrategy} from "../scripts/IResponseStrategy";
import IContextProvider from "../scripts/IContextProvider";

describe("Test command dispatcher", () => {

    let subject: TestCommandDispatcher;
    let dateRetriever: IMock<IDateRetriever>;
    let guidGenerator: IMock<IGUIDGenerator>;
    let contextProvider: IMock<IContextProvider>;
    let contextRegistryChecker: IMock<IContextRegistryChecker>;
    let modelPusher: IMock<IModelPusher>;
    let modelResolver: IMock<IModelResolver>;
    let nextCommandDispatcher: IMock<ICommandDispatcher>;
    let responseStrategy: IMock<IResponseStrategy>;
    let testCommand: TestCommand;
    let viewModelContext: ViewModelContext;

    before(() => {
        viewModelContext = new ViewModelContext("testArea", "testId");
        dateRetriever = Mock.ofType<IDateRetriever>();
        dateRetriever.setup(d => d.getDate()).returns(() => "2016-10-05T14:48:00.000Z");
        guidGenerator = Mock.ofType<IGUIDGenerator>();
        guidGenerator.setup(g => g.generate()).returns(() => "fee3aa6e-79f8-4abd-8ca4-3f1ebe0db298");
        contextProvider = Mock.ofType<IContextProvider>();
        contextProvider.setup(c => c.getContext()).returns(() => viewModelContext);
        modelResolver = Mock.ofType<IModelResolver>();
        modelResolver.setup(m => m.resolve(It.isValue(viewModelContext), It.isAnyString())).returns(() => ({name: "testModel"}));
        testCommand = new TestCommand("test", "testType");
    });

    context("Given a command that requires a mocked handling", () => {

        beforeEach(() => {
            contextRegistryChecker = Mock.ofType<IContextRegistryChecker>();
            contextRegistryChecker.setup(v => v.exists(It.isValue(viewModelContext))).returns(() => true);
            nextCommandDispatcher = Mock.ofType<ICommandDispatcher>();
            modelPusher = Mock.ofType<IModelPusher>();
            responseStrategy = Mock.ofType<IResponseStrategy>();
            subject = new TestCommandDispatcher(dateRetriever.object, guidGenerator.object, contextProvider.object, contextRegistryChecker.object, modelPusher.object, modelResolver.object, responseStrategy.object);
            subject.setNext(nextCommandDispatcher.object);
        });

        context("and the command response has to be successful", () => {

            beforeEach(() => {
                responseStrategy.reset();
                responseStrategy.setup(r => r.getResponseStatus(It.isAny(), It.isAny())).returns(() => true);
            });

            it("should send the command related model to the model pusher", () => {
                subject.dispatch(testCommand);
                modelPusher.verify(m => m.pushModel(It.isValue({name: "testModel"}), It.isValue(new ViewModelContext("testArea", "testId"))), Times.once());
                nextCommandDispatcher.verify(n => n.dispatch(It.isAny()), Times.never());
            });

            it("should return a promise that resolves in a successful response", async () => {
                let result = await subject.dispatch(testCommand);
                expect(result.response.status).to.be(200);
            });
        });

        context("and the command response has to be unsuccessful", () => {

            beforeEach(() => {
                responseStrategy.reset();
                responseStrategy.setup(r => r.getResponseStatus(It.isAny(), It.isAny())).returns(() => false);
            });

            it("should not send the command related model to the model pusher", () => {
                subject.dispatch(testCommand).catch((error) => {
                });
                modelPusher.verify(m => m.pushModel(It.isAny(), It.isAny()), Times.never());
                nextCommandDispatcher.verify(n => n.dispatch(It.isAny()), Times.never());
            });

            it("should return a promise that rejects in a unsuccessful response", (done) => {
                subject.dispatch(testCommand)
                    .then((result) => {
                        expect().fail();
                    })
                    .catch((result) => {
                        expect(result.response.status).to.be(400);
                        done();
                    });
            });
        });
    });

    context("Given a command that doesn't require a mocked handling", () => {

        beforeEach(() => {
            contextRegistryChecker = Mock.ofType<IContextRegistryChecker>();
            contextRegistryChecker.setup(v => v.exists(It.isValue(viewModelContext))).returns(() => false);
            nextCommandDispatcher = Mock.ofType<ICommandDispatcher>();
            modelPusher = Mock.ofType<IModelPusher>();
            subject = new TestCommandDispatcher(dateRetriever.object, guidGenerator.object, contextProvider.object, contextRegistryChecker.object, modelPusher.object, modelResolver.object, responseStrategy.object);
            subject.setNext(nextCommandDispatcher.object);
        });

        it("should pass the command to the next element in the chain", () => {
            subject.dispatch(testCommand);
            modelPusher.verify(m => m.pushModel(It.isValue({name: "testModel"}), It.isValue(new ViewModelContext("testArea", "testId"))), Times.never());
            nextCommandDispatcher.verify(n => n.dispatch(It.isValue(testCommand), undefined), Times.once());
        });
    });
});