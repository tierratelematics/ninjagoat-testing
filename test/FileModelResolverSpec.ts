import "reflect-metadata";
import expect = require("expect.js");

import Models from "./fixtures/Models";
import { ViewModelContext } from "ninjagoat";
import { FileModelResolver } from "../scripts/resolver/FileModelResolver";

describe("The FileModelResolver", () => {
    let subject: FileModelResolver;


    beforeEach(() => {
        subject = new FileModelResolver(Models);
    });

    context("when a model is requested for a context but there isn't an area folder ", () => {
        it("should return an empty model", () => {
            expect(subject.resolve(new ViewModelContext("anInvalidArea", "aViewmodelId"))).to.be(null);
        });
    });

    context("when the default model is requested for a context", () => {
        context("when the context not has a viewmodelId or has a special one (Master, Index, NotFound)", () => {
            it("should return the model named default in the area folder, if exist", () => {
                expect(subject.resolve(new ViewModelContext("Master", ""))).to.be(Models.Master.default);
            });
        });
        context("when the there isn't a viewmodelId folder", () => {
            it("should return an empty model", () => {
                expect(subject.resolve(new ViewModelContext("anArea", "anInvalidViewmodelId"))).to.be(null);
            });
        });
        context("when the there is a viewmodelId folder", () => {
            it("should return the model named default in the folder, if exist", () => {
                expect(subject.resolve(new ViewModelContext("anArea", "aViewModelId"))).to.be(Models.anArea.aViewModelId.default);
            });
        });
    });

    context("when a specific model is requested for a context", () => {
        it("should behave like when requested a default model but responding with the model named like the type", () => {
            expect(subject.resolve(new ViewModelContext("anInvalidArea", "aViewmodelId"), "aCommand")).to.be(null);
            expect(subject.resolve(new ViewModelContext("Master", ""), "aCommand")).to.be(Models.Master.aCommand);
            expect(subject.resolve(new ViewModelContext("anArea", "anInvalidViewmodelId"), "aCommand")).to.be(null);
            expect(subject.resolve(new ViewModelContext("anArea", "aViewModelId"), "aCommand")).to.be(Models.anArea.aViewModelId.aCommand);
        });
    });
});
