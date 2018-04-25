"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Dog_1 = require("./data/entities/Dog");
const Cat_1 = require("./data/entities/Cat");
const Sheep_1 = require("./data/entities/Sheep");
const SyncPromise_1 = require("syncasync/lib/SyncPromise");
describe('.asSingleton', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When .get call is not first, should be resolved with same instance', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName))
            .asSingleton();
        SyncPromise_1.SyncPromise.all([
            container.get(index_1.TYPES.ISheep).then(spy, notCallableSpy),
            container.get(index_1.TYPES.ISheep).then(spy, notCallableSpy)
        ])
            .catch(notCallableSpy)
            .then((res) => {
            chai_1.expect(spy.getCall(0).args[0]).to.be.equal(spy.getCall(1).args[0]);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When .get call is not first, should be resolved with same dependency instances', done => {
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.register(index_1.TYPES.ICat)
            .deps(index_1.TYPES.ISheep)
            .resolver(deps => new Cat_1.Cat(deps.ISheep));
        container.register(index_1.TYPES.IDog)
            .deps(index_1.TYPES.ICat, index_1.TYPES.ISheep)
            .resolver(deps => new Dog_1.Dog(deps.ICat, deps.ISheep))
            .asSingleton();
        SyncPromise_1.SyncPromise.all([
            container.get(index_1.TYPES.IDog).then(spy, notCallableSpy),
            container.get(index_1.TYPES.IDog).then(spy, notCallableSpy)
        ])
            .catch(notCallableSpy)
            .then(() => {
            const result1 = spy.getCall(0).args[0];
            const result2 = spy.getCall(1).args[0];
            chai_1.expect(result1.sheep).to.be.equal(result2.sheep);
            chai_1.expect(result1.sheep.name).to.be.equal(result2.sheep.name);
            chai_1.expect(result1.cat).to.be.equal(result2.cat);
            chai_1.expect(result1.cat.sheep).to.be.equal(result2.cat.sheep);
            chai_1.expect(result1.cat.sheep.name).to.be.equal(result2.cat.sheep.name);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
