import expect = require("expect.js");
import {ViewModelContext} from "ninjagoat";
import {DefaultResponseStrategy} from "../scripts/DefaultResponseStrategy";

describe("Default response strategy", () => {

    let subject: DefaultResponseStrategy;
    let n: number;
    let viewModelContext: ViewModelContext;
    let commandEnvelope: { type: string };

    context("Given the number of desired true status before a bad one", () => {

        before(() => {
            n = 3;
            subject = new DefaultResponseStrategy(n);
            viewModelContext = new ViewModelContext("testArea", "testId");
            commandEnvelope = {type: "testType"};
        });

        context("Given a viewmodel context and a command envelope", () => {

            it("should return a false status every n true status", () => {
                let response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.not.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.be.ok();
                response = subject.getResponseStatus(viewModelContext, commandEnvelope as any);
                expect(response).to.not.be.ok();
            });
        });
    });
});