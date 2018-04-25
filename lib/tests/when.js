"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Sheep_1 = require("./data/entities/Sheep");
describe('.when', () => {
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
            .when(() => false)
            .resolver(deps => 'FirstDeclaration');
        container.register(index_1.TYPES.ISheepName)
            .when(() => true)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('SecondDeclaration');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returns false, another declaration should be resolved', done => {
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .when(() => true)
            .resolver(deps => 'FirstDeclaration');
        container.register(index_1.TYPES.ISheepName)
            .when(() => false)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FirstDeclaration');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('By default returned value is true', done => {
        container.register(index_1.TYPES.ISheepName)
            .when(() => true)
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
    it('When declared several "when" callbacks, should execute all', done => {
        const whenSpy1 = sinon.spy(() => true);
        const whenSpy2 = sinon.spy(() => true);
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .when(whenSpy1)
            .when(whenSpy2)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('SecondDeclaration');
            chai_1.expect(whenSpy1.called).to.be.true;
            chai_1.expect(whenSpy2.called).to.be.true;
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When one of several "when" callbacks return false, another declaration should be resolved', done => {
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .when(() => false)
            .when(() => true)
            .resolver(deps => 'SecondDeclaration');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('DefaultSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('Context object should has current module name at "name" field', done => {
        const spy = sinon.spy(() => true);
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheepName)
            .when(spy)
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].name).to.be.equal(index_1.TYPES.ISheepName);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('Context object should has context of parent module at "parent" field', done => {
        const spy = sinon.spy(() => true);
        const parentSpy = sinon.spy(() => true);
        container.register(index_1.TYPES.ISheepName).resolver(deps => 'DefaultSheepName');
        container.register(index_1.TYPES.ISheep).resolver(deps => 'DefaultSheep');
        container.register(index_1.TYPES.ISheepName)
            .when(spy)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .when(parentSpy)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.get(index_1.TYPES.ISheep)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].parent).to.be.equal(parentSpy.firstCall.args[0]);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
