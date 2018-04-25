"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Sheep_1 = require("./data/entities/Sheep");
const SyncPromise_1 = require("syncasync/lib/SyncPromise");
describe('.resolver', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When more than one resolver is not defined, should throw exception', done => {
        container.register(index_1.TYPES.ISheepName);
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.instanceof(Error);
            chai_1.expect(spy.firstCall.args[0].message).to.include('Resolver is not defined');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When more than one resolver defined, should throw exception', done => {
        const registration = () => {
            container.register(index_1.TYPES.ISheepName)
                .resolver(deps => 'FakeSheepNameOne')
                .resolver(deps => 'FakeSheepNameTwo');
        };
        chai_1.expect(registration).to.be.throw(/duplicate resolver declaration/gi);
        done();
    });
    it('When resolver throw exception, should be rejected with that exeption', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => { throw 'FakeMessage'; });
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeMessage');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When declaration has deps and requires, should pass all by names', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .require('Sheep', () => Sheep_1.Sheep)
            .resolver(spy);
        container.get(index_1.TYPES.ISheep)
            .catch(notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0].ISheepName).to.be.equal('FakeSheepName');
            chai_1.expect(spy.firstCall.args[0].Sheep).to.be.equal(Sheep_1.Sheep);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
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
            .resolver(deps => Promise.resolve('FakeSheepName'));
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is resolved SyncPromise, should be resolved with value of that SyncPromise', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => SyncPromise_1.SyncPromise.resolve('FakeSheepName'));
        container.get(index_1.TYPES.ISheepName)
            .then(spy, notCallableSpy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is rejected Promise, should be rejected with value of that Promise', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => Promise.reject('FakeSheepName'));
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When returned value is rejected SyncPromise, should be rejected with value of that SyncPromise', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => SyncPromise_1.SyncPromise.reject('FakeSheepName'));
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
