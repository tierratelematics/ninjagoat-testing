import "reflect-metadata";
// import * as Rx from "rx";
import * as Rx from "rx";
import { Times } from "typemoq";
import * as TypeMoq from "typemoq";
import expect = require("expect.js");

import { CommandEnvelope } from "ninjagoat-commands";
import { Dictionary, ViewModelContext } from "ninjagoat";
import { IModelRetriever, ModelState, ModelPhase } from "ninjagoat-projections";
import { IContextRegistryChecker } from "../scripts/registry/IContextRegistryChecker";
import { FileModelRetriever } from "../scripts/FileModelRetriever";

describe("The FileModelRetriever", () => {
    let subject: FileModelRetriever;
    let checker: TypeMoq.IMock<IContextRegistryChecker>;
    let retriever: TypeMoq.IMock<IModelRetriever>;
    let _context: ViewModelContext;
    let invalidContext: ViewModelContext;
    let command: CommandEnvelope;
    let files: Dictionary<Dictionary<any>>;
    let notifications: ModelState<any>[];
    let testScheduler: Rx.TestScheduler;


    beforeEach(() => {
        notifications = [];
        retriever = TypeMoq.Mock.ofType<IModelRetriever>();
        checker = TypeMoq.Mock.ofType<IContextRegistryChecker>();
        _context = { area: "anArea", viewmodelId: "anId", parameters: {} };
        command = <CommandEnvelope>{ type: "aCommand" };

        invalidContext = { area: "anArea", viewmodelId: "anIdW/outMock", parameters: {} };
        files = { "anArea": { "anId": { "_": { "id": "baseModel" }, "aCommand": { "id": "commandModel" } } } };

        retriever.setup(r => r.modelFor(TypeMoq.It.isAny())).returns(() => null);
        checker.setup(c => c.exist(TypeMoq.It.isAny())).returns(() => true);

        testScheduler = new Rx.TestScheduler();

        subject = new FileModelRetriever(retriever.object, checker.object, files, testScheduler);
    });


    context("when required a model for a context", () => {
        it("should verify if the context is registered", () => {
            subject.modelFor<any>(_context);
            checker.verify(c => c.exist(TypeMoq.It.isValue<ViewModelContext>(_context)), Times.once());
        });

        context("when the context is invalid", () => {
            it("should throw an error", () => {
                expect(() => subject.modelFor(null)).to.throwError();
                expect(() => subject.modelFor(<ViewModelContext>{})).to.throwError();
                expect(() => subject.modelFor(<ViewModelContext>{ viewmodelId: "anId" })).to.throwError();
            });
        });

        context("when the context is registered", () => {
            context("and the mock file exists", () => {
                it("should return a loading model state follow by a ready model state with the mock file for the requested context", () => {
                    subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

                    testScheduler.advanceBy(2000);
                    expect(notifications.length).to.be(2);
                    expect(notifications[0].phase).to.be(ModelPhase.Loading);
                    expect(notifications[1].phase).to.be(ModelPhase.Ready);
                    expect(notifications[1].model).to.be.eql(files["anArea"]["anId"]["_"]);
                });
            });

            context("but the mock file not exists", () => {
                it("should return a loading model state follow by a failed model state", () => {
                    subject.modelFor<any>(invalidContext).subscribe(data => notifications.push(data))

                    testScheduler.advanceBy(2000);
                    expect(notifications.length).to.be(2);
                    expect(notifications[0].phase).to.be(ModelPhase.Loading);
                    expect(notifications[1].phase).to.be(ModelPhase.Failed);
                });
            });
        });

        context("when the context is not registered", () => {
            it("should delegate to the model retriever", () => {
                checker.reset();
                checker.setup(c => c.exist(TypeMoq.It.isValue<ViewModelContext>(_context))).returns(() => false);

                subject.modelFor<any>(_context);
                retriever.verify(r => r.modelFor<any>(TypeMoq.It.isValue<ViewModelContext>(_context)), Times.once());
            });
        });

    });

    context("when a command is handled", () => {
        context("and the mock file for the command exists", () => {
            it("should send immediately a loading model state follow by a ready model state with the mock file", () => {
                subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

                testScheduler.advanceBy(2000);
                subject.handle(command, _context);

                testScheduler.advanceBy(2000);
                expect(notifications.length).to.be(4);
                expect(notifications[2].phase).to.be(ModelPhase.Loading);
                expect(notifications[3].phase).to.be(ModelPhase.Ready);
                expect(notifications[3].model).to.be.eql(files["anArea"]["anId"]["aCommand"]);
            });
        });

        context("but the mock file for the command do not exists", () => {
            it("should send immediately a loading model state follow by a failed model state", () => {
                subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

                testScheduler.advanceBy(2000);
                command.type = "anInvalidCommand";
                subject.handle(command, _context);

                testScheduler.advanceBy(2000);
                expect(notifications.length).to.be(4);
                expect(notifications[2].phase).to.be(ModelPhase.Loading);
                expect(notifications[3].phase).to.be(ModelPhase.Failed);
            });
        });

        context("but the was never retrieved the model", () => {
            it("should throw an error", () => {
                expect(() => subject.handle(command, invalidContext)).to.throwError();
            });
        });
    });
});
