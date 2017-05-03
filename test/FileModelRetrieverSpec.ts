import "reflect-metadata";
import * as Rx from "rx";
import { Times } from "typemoq";
import * as TypeMoq from "typemoq";
import expect = require("expect.js");

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
    let files: Dictionary<Dictionary<any>>;
    let notifications: ModelState<any>[];
    let testScheduler: Rx.TestScheduler;


    beforeEach(() => {
        notifications = [];
        retriever = TypeMoq.Mock.ofType<IModelRetriever>();
        checker = TypeMoq.Mock.ofType<IContextRegistryChecker>();
        _context = { area: "anArea", viewmodelId: "anId", parameters: {} };

        invalidContext = { area: "anArea", viewmodelId: "anIdW/outMock", parameters: {} };
        files = { "anArea": { "anId": { "__INIT": { "id": "baseModel" }, "aCommand": { "id": "commandModel" } } } };

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
                    expect(notifications[1].model).to.be.eql(files["anArea"]["anId"]["__INIT"]);
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

    context("when a model is pushed", () => {
        it("should send immediately a loading model state follow by a ready model state with the mock file", () => {
            subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

            testScheduler.advanceBy(2000);
            subject.pushModel(files["anArea"]["anId"]["aCommand"], _context);

            testScheduler.advanceBy(2000);
            expect(notifications.length).to.be(4);
            expect(notifications[2].phase).to.be(ModelPhase.Loading);
            expect(notifications[3].phase).to.be(ModelPhase.Ready);
            expect(notifications[3].model).to.be.eql(files["anArea"]["anId"]["aCommand"]);
        });
    });

    context("but the model was never retrieved", () => {
        it("should throw an error", () => {
            expect(() => subject.pushModel(files["anArea"]["anId"]["aCommand"], invalidContext)).to.throwError();
        });
    });
});
