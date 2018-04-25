"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Sheep_1 = require("./data/entities/Sheep");
describe('declaration matching', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When existed several declaration with same condition, should be resolved last of them', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FirstDeclaration');
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('SecondDeclaration');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When existed several declaration with same condition, should be resolved last of them', done => {
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(ctx => ctx.name === index_1.TYPES.ISheep)
            .resolver(deps => 'FirstSheepName');
        container.register(index_1.TYPES.ISheepName)
            .when(ctx => ctx.name === index_1.TYPES.ISheepName)
            .resolver(deps => 'SecondSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.get(index_1.TYPES.ISheep)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].name).to.be.equal('SecondSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When not defined default declaration, should throw exception', done => {
        container.register(index_1.TYPES.ISheepName)
            .when(ctx => ctx.name === index_1.TYPES.ISheep)
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.instanceof(Error);
            chai_1.expect(spy.firstCall.args[0].message).to.be.include('ISheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
