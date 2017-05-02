import "reflect-metadata";
import expect = require("expect.js");

import { ViewModelContext } from "ninjagoat";
import { ContextRegistry } from "../scripts/registry/ContextRegistry";

describe("Given a ContextRegistry", () => {
    let subject: ContextRegistry;
    let _context: ViewModelContext;

    beforeEach(() => {
        subject = new ContextRegistry();
        _context = { area: "anArea", viewmodelId: "anId", parameters: {} };
    });

    context("when a context is added", () => {
        it("should be retrievable", () => {
            subject.register(_context);
            expect(subject.exist(_context)).to.be(true);
        });
    });

    context("when an invalid context is added", () => {
        it("should throw an error", () => {
            expect(() => subject.register(null)).to.throwError();
            expect(() => subject.register(<ViewModelContext>{})).to.throwError();
            expect(() => subject.register(<ViewModelContext>{ viewmodelId: "anId" })).to.throwError();
        });
    });

    context("when an unregistered context is retrieved", () => {
        it("should be return null", () => {
            expect(subject.exist(_context)).to.be(false);
        });
    });

    context("when an invalid context is retrieved", () => {
        it("should throw an error", () => {
            expect(() => subject.exist(null)).to.throwError();
            expect(() => subject.exist(<ViewModelContext>{})).to.throwError();
            expect(() => subject.exist(<ViewModelContext>{ viewmodelId: "anId" })).to.throwError();
        });
    });
});
