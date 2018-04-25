"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Sheep_1 = require("./data/entities/Sheep");
describe('.whenParent', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When returns true, declaration should be resolved', done => {
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(() => true)
            .resolver(deps => 'SecondDeclaration');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.get(index_1.TYPES.ISheep)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].name).to.be.equal('SecondDeclaration');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returns false, another declaration should be resolved', done => {
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(() => false)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('DefaultSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When declared several "whenParent" callbacks, should execute all', done => {
        const whenSpy1 = sinon.spy(() => true);
        const whenSpy2 = sinon.spy(() => true);
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(whenSpy1)
            .whenParent(whenSpy2)
            .resolver(deps => 'SecondDeclaration');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.get(index_1.TYPES.ISheep)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].name).to.be.equal('SecondDeclaration');
            chai_1.expect(whenSpy1.called).to.be.true;
            chai_1.expect(whenSpy2.called).to.be.true;
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When one of several "whenParent" callbacks return false, another declaration should be resolved', done => {
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(() => false)
            .whenParent(() => true)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('DefaultSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When parent is existed, argument should be parent context object', done => {
        const spy = sinon.spy(() => true);
        const parentSpy = sinon.spy(() => true);
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheep).resolver(deps => 'DefaultSheep');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(spy)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .when(parentSpy)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.get(index_1.TYPES.ISheep)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal(parentSpy.firstCall.args[0]);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When parent is not existed, should be resolved another declaration', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FirstDeclaration');
        container.register(index_1.TYPES.ISheepName)
            .whenParent(() => true)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FirstDeclaration');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
