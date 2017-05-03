import "reflect-metadata";
import * as Rx from "rx";
import { Times } from "typemoq";
import * as TypeMoq from "typemoq";
import expect = require("expect.js");

import { ViewModelContext } from "ninjagoat";
import { IModelRetriever, ModelState, ModelPhase } from "ninjagoat-projections";
import { IContextRegistryChecker } from "../scripts/registry/IContextRegistryChecker";
import { FileModelRetriever } from "../scripts/FileModelRetriever";
import { IModelResolver } from "../scripts/resolver/IModelResolver";

describe("The FileModelRetriever", () => {
    let subject: FileModelRetriever;
    let checker: TypeMoq.IMock<IContextRegistryChecker>;
    let retriever: TypeMoq.IMock<IModelRetriever>;
    let resolver: TypeMoq.IMock<IModelResolver>;
    let _context: ViewModelContext;
    let invalidContext: ViewModelContext;
    let notifications: ModelState<any>[];
    let testScheduler: Rx.TestScheduler;


    beforeEach(() => {
        notifications = [];
        retriever = TypeMoq.Mock.ofType<IModelRetriever>();
        checker = TypeMoq.Mock.ofType<IContextRegistryChecker>();
        resolver = TypeMoq.Mock.ofType<IModelResolver>();
        _context = { area: "anArea", viewmodelId: "anId", parameters: {} };

        invalidContext = { area: "anArea", viewmodelId: "anIdW/outMock", parameters: {} };

        retriever.setup(r => r.modelFor(TypeMoq.It.isAny())).returns(() => null);
        checker.setup(c => c.exists(TypeMoq.It.isAny())).returns(() => true);
        resolver.setup(r => r.resolve(TypeMoq.It.isAny())).returns(() => ({ "id": "baseModel" }));

        testScheduler = new Rx.TestScheduler();

        subject = new FileModelRetriever(retriever.object, checker.object, resolver.object, testScheduler);
    });


    context("when required a model for a context", () => {
        it("should verify if the context is registered", () => {
            subject.modelFor<any>(_context);
            checker.verify(c => c.exists(TypeMoq.It.isValue<ViewModelContext>(_context)), Times.once());
        });

        context("when the context is invalid", () => {
            it("should throw an error", () => {
                expect(() => subject.modelFor(null)).to.throwError();
                expect(() => subject.modelFor(<ViewModelContext>{})).to.throwError();
                expect(() => subject.modelFor(<ViewModelContext>{ viewmodelId: "anId" })).to.throwError();
            });
        });

        context("when the context is registered", () => {
            context("and the model exists", () => {
                it("should return a loading model state followed by a ready model state with the model for the requested context", () => {
                    subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

                    testScheduler.advanceBy(2000);
                    expect(notifications.length).to.be(2);
                    expect(notifications[0].phase).to.be(ModelPhase.Loading);
                    expect(notifications[1].phase).to.be(ModelPhase.Ready);
                    expect(notifications[1].model).to.be.eql({ "id": "baseModel" });
                });
            });

            context("but the model not exists", () => {
                it("should return a loading model state followed by a failed model state", () => {
                    resolver.reset();
                    resolver.setup(r => r.resolve(TypeMoq.It.isAny())).returns(() => null);

                    subject.modelFor<any>(invalidContext).subscribe(data => notifications.push(data));

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
                checker.setup(c => c.exists(TypeMoq.It.isValue<ViewModelContext>(_context))).returns(() => false);

                subject.modelFor<any>(_context);
                retriever.verify(r => r.modelFor<any>(TypeMoq.It.isValue<ViewModelContext>(_context)), Times.once());
            });
        });

    });

    context("when a model is pushed", () => {
        it("should send immediately a loading model state followed by a ready model state with the model", () => {
            subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

            testScheduler.advanceBy(2000);
            subject.pushModel({ "id": "aCommandModel" }, _context);

            testScheduler.advanceBy(2000);
            expect(notifications.length).to.be(4);
            expect(notifications[2].phase).to.be(ModelPhase.Loading);
            expect(notifications[3].phase).to.be(ModelPhase.Ready);
            expect(notifications[3].model).to.be.eql({ "id": "aCommandModel" });
        });


    });

    context("when an empty model is pushed", () => {
        it("should send immediately a loading model state followed by a failed model state", () => {
            subject.modelFor<any>(_context).subscribe(data => notifications.push(data));

            testScheduler.advanceBy(2000);
            subject.pushModel(null, _context);

            testScheduler.advanceBy(2000);
            expect(notifications.length).to.be(4);
            expect(notifications[2].phase).to.be(ModelPhase.Loading);
            expect(notifications[3].phase).to.be(ModelPhase.Failed);
        });
    });

    context("but the model was never retrieved", () => {
        it("should throw an error", () => {
            expect(() => subject.pushModel({ "id": "aCommandModel" }, invalidContext)).to.throwError();
        });
    });

    context("but the context is invalid", () => {
        it("should throw an error", () => {
            expect(() => subject.pushModel({ "id": "aCommandModel" }, null)).to.throwError();
            expect(() => subject.pushModel({ "id": "aCommandModel" }, <ViewModelContext>{})).to.throwError();
            expect(() => subject.pushModel({ "id": "aCommandModel" }, <ViewModelContext>{ viewmodelId: "anId" })).to.throwError();
        });
    });
});
