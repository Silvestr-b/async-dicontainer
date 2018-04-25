"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Sheep_1 = require("./data/entities/Sheep");
const SyncPromise_1 = require("syncasync/lib/SyncPromise");
describe('.get', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When module is not registered, should be rejected with that exception', done => {
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.instanceof(Error);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When one module name is passed, should be resolved with value that was returned by resolver', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.calledWith('FakeSheepName')).to.be.true;
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When several names is passed, should be resolved with values by name', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISomeString)
            .resolver(deps => 'FakeString');
        container.get(index_1.TYPES.ISheepName, index_1.TYPES.ISomeString)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].ISheepName).to.be.equal('FakeSheepName');
            chai_1.expect(spy.firstCall.args[0].ISomeString).to.be.equal('FakeString');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When declaration or dependency declaration do not has Promises or SyncPromises, should return SyncPromise', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .require('Fake', () => 'FakeString')
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        chai_1.expect(container.get(index_1.TYPES.ISheepName)).to.be.instanceof(SyncPromise_1.SyncPromise);
        chai_1.expect(container.get(index_1.TYPES.ISheep)).to.be.instanceof(SyncPromise_1.SyncPromise);
        done();
    });
    it('When declaration or dependency declaration do not has Promises but has SyncPromises, should return SyncPromise', done => {
        container.register(index_1.TYPES.ISomeString)
            .require('Fake', () => SyncPromise_1.SyncPromise.resolve('FakeString'))
            .resolver(deps => 'FakeString');
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => SyncPromise_1.SyncPromise.resolve('FakeSheepName'));
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        chai_1.expect(container.get(index_1.TYPES.ISomeString)).to.be.instanceof(SyncPromise_1.SyncPromise);
        chai_1.expect(container.get(index_1.TYPES.ISheepName)).to.be.instanceof(SyncPromise_1.SyncPromise);
        chai_1.expect(container.get(index_1.TYPES.ISheep)).to.be.instanceof(SyncPromise_1.SyncPromise);
        done();
    });
    it('When declaration or dependency declaration has Promise, should return Promise', done => {
        container.register(index_1.TYPES.ISomeString)
            .require('Fake', () => Promise.resolve('FakeString'))
            .resolver(deps => 'FakeString');
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => Promise.resolve('FakeSheepName'));
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        chai_1.expect(container.get(index_1.TYPES.ISomeString)).to.be.instanceof(Promise);
        chai_1.expect(container.get(index_1.TYPES.ISheepName)).to.be.instanceof(Promise);
        chai_1.expect(container.get(index_1.TYPES.ISheep)).to.be.instanceof(Promise);
        done();
    });
});
