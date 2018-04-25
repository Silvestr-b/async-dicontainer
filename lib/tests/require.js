"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const SyncPromise_1 = require("syncasync/lib/SyncPromise");
describe('.require', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When throws exception, should be rejected with that exeption', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('Name', () => { throw 'FakeMessage'; })
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeMessage');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When has promise, should be resolved before any resolvers', done => {
        const resolverSpy1 = sinon.spy(() => Promise.resolve(5));
        const resolverSpy2 = sinon.spy(() => Promise.resolve(5));
        const resolverSpy3 = sinon.spy(() => Promise.resolve(5));
        const resolverSpy4 = sinon.spy(() => Promise.resolve(5));
        const requireSpy1 = sinon.spy(() => Promise.resolve(5));
        const requireSpy2 = sinon.spy(() => Promise.resolve(5));
        const requireSpy3 = sinon.spy(() => Promise.resolve(5));
        const requireSpy4 = sinon.spy(() => Promise.resolve(5));
        container.register(index_1.TYPES.ISheepName)
            .require('Name', requireSpy1)
            .resolver(resolverSpy1);
        container.register(index_1.TYPES.ISheep)
            .require('Name', requireSpy2)
            .deps(index_1.TYPES.ISheepName)
            .resolver(resolverSpy2);
        container.register(index_1.TYPES.ICat)
            .require('Name', requireSpy3)
            .deps(index_1.TYPES.ISheep)
            .resolver(resolverSpy3);
        container.register(index_1.TYPES.IDog)
            .require('Name', requireSpy4)
            .deps(index_1.TYPES.ICat, index_1.TYPES.ISheep)
            .resolver(resolverSpy4);
        container.get(index_1.TYPES.IDog)
            .then(spy, notCallableSpy)
            .then(() => {
            [requireSpy1, requireSpy2, requireSpy3, requireSpy4].forEach(requireSpy => {
                [resolverSpy1, resolverSpy2, resolverSpy3, resolverSpy4].forEach(resolverSpy => {
                    chai_1.expect(requireSpy.calledBefore(resolverSpy)).to.be.true;
                });
            });
        })
            .then(() => done());
    });
    it('When data is resolved, should pass that to resolver by name', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('RequiredData', () => 'FakeData')
            .resolver(spy);
        container.get(index_1.TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].RequiredData).to.be.equal('FakeData');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When declared several required callbacks, should pass all of them result to resolver by name', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('RequiredData1', () => 'FakeData1')
            .require('RequiredData2', () => 'FakeData2')
            .require('RequiredData3', () => 'FakeData3')
            .resolver(spy);
        container.get(index_1.TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
            const result = spy.firstCall.args[0];
            chai_1.expect(result.RequiredData1).to.be.equal('FakeData1');
            chai_1.expect(result.RequiredData2).to.be.equal('FakeData2');
            chai_1.expect(result.RequiredData3).to.be.equal('FakeData3');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When declared several callbacks by one name, should throw exception', done => {
        const registration = () => container.register(index_1.TYPES.ISheepName)
            .require('RequiredData', () => 'FakeData1')
            .require('RequiredData', () => 'FakeData2')
            .resolver(() => 'FakeSheepName');
        chai_1.expect(registration).to.throw(/RequiredData/gi);
        done();
    });
    it('When that name was be declared at deps, should throw exception', done => {
        const registration = () => container.register(index_1.TYPES.ISheepName)
            .deps(index_1.TYPES.ICat)
            .require(index_1.TYPES.ICat, () => 'FakeData')
            .resolver(() => 'FakeSheepName');
        chai_1.expect(registration).to.throw(new RegExp(index_1.TYPES.ICat, 'i'));
        done();
    });
    it('When returned value is value, should be resolved with that value', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is resolved Promise, should be resolved with value of that Promise', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('RequiredDataName', () => Promise.resolve('FakeRequiredData'))
            .resolver(spy);
        container.get(index_1.TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].RequiredDataName).to.be.equal('FakeRequiredData');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is resolved SyncPromise, should be resolved with value of that SyncPromise', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('RequiredDataName', () => SyncPromise_1.SyncPromise.resolve('FakeRequiredData'))
            .resolver(spy);
        container.get(index_1.TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].RequiredDataName).to.be.equal('FakeRequiredData');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is rejected Promise, should be rejected with value of that Promise', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('RequiredDataName', () => Promise.reject('FakeMessage'))
            .resolver(deps => deps.RequiredDataName);
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeMessage');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is rejected SyncPromise, should be rejected with value of that SyncPromise', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('RequiredDataName', () => SyncPromise_1.SyncPromise.reject('FakeMessage'))
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeMessage');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
