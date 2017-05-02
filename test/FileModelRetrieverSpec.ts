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
    let files: Dictionary<Dictionary<any>>;

    beforeEach(() => {
        checker = TypeMoq.Mock.ofType<IContextRegistryChecker>();
        retriever = TypeMoq.Mock.ofType<IModelRetriever>();
        _context = { area: "anArea", viewmodelId: "anId", parameters: {} };
        files = { "anArea": { "anId": { "_": { "id": "baseModel" }, "aCommand": { "id": "commandModel" } } } };

        retriever.setup(r => r.modelFor(TypeMoq.It.isAny())).returns(() => null);
        checker.setup(c => c.exist(TypeMoq.It.isAny())).returns(() => true);

        subject = new FileModelRetriever(retriever.object, checker.object, files);
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
            it("should send immediately a loading model state", done => {
                subject.modelFor<any>(_context).subscribe((data: ModelState<any>) => {
                    expect(data.phase).to.be(ModelPhase.Loading);
                    done();
                });
            });

            context("and the mock file exists", () => {
                it("should return a ready model state with the mock file for the requested context", done => {
                    subject.modelFor<any>(_context).subscribe((data: ModelState<any>) => {
                        if (data.phase === ModelPhase.Loading) return;
                        expect(data.phase).to.be(ModelPhase.Ready);
                        expect(data.model).to.be.eql(files["anArea"]["anId"]["_"]);
                        done();
                    });
                });
            });

            context("but the mock file not exists", () => {
                it("should return a failed model state", done => {
                    subject.modelFor<any>({ area: "anArea", viewmodelId: "anIdW/outMock", parameters: {} }).subscribe((data: ModelState<any>) => {
                        if (data.phase === ModelPhase.Loading) return;
                        expect(data.phase).to.be(ModelPhase.Failed);
                        done();
                    });
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
});