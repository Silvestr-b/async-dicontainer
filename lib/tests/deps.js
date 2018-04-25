"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const index_1 = require("./data/types/index");
const Dog_1 = require("./data/entities/Dog");
const Cat_1 = require("./data/entities/Cat");
const Sheep_1 = require("./data/entities/Sheep");
describe('.deps', () => {
    let container;
    let spy;
    let notCallableSpy;
    beforeEach(() => {
        container = new _1.Container();
        spy = sinon.spy();
        notCallableSpy = sinon.spy();
    });
    it('When dependencies for module is declared, should resolve and pass to resolver deps by name', done => {
        container.register(index_1.TYPES.ISomeString)
            .resolver(deps => 'FakeString');
        container.register(index_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName, index_1.TYPES.ISomeString)
            .resolver(spy);
        container.get(index_1.TYPES.ISheep)
            .catch(notCallableSpy)
            .then(() => {
            const result = spy.firstCall.args[0];
            chai_1.expect(result.ISheepName).to.be.equal('FakeSheepName');
            chai_1.expect(result.ISomeString).to.be.equal('FakeString');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When dependencies have own dependencies, should recursively resolve all dependency', done => {
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
            .resolver(deps => new Dog_1.Dog(deps.ICat, deps.ISheep));
        container.get(index_1.TYPES.IDog)
            .then(spy, notCallableSpy)
            .then(() => {
            const result = spy.firstCall.args[0];
            chai_1.expect(result).to.be.instanceOf(Dog_1.Dog);
            chai_1.expect(result.sheep).to.be.instanceOf(Sheep_1.Sheep);
            chai_1.expect(result.sheep.name).to.be.string;
            chai_1.expect(result.cat).to.be.instanceOf(Cat_1.Cat);
            chai_1.expect(result.cat.sheep).to.be.instanceOf(Sheep_1.Sheep);
            chai_1.expect(result.cat.sheep.name).to.be.string;
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When dependency is not declared, should be rejected with exeption', done => {
        container.register(index_1.TYPES.ISheepName)
            .deps('NotExistedDependency')
            .resolver(deps => 'FakeSheepName');
        container.get(index_1.TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.instanceOf(Error);
            chai_1.expect(spy.firstCall.args[0].message).to.be.include('NotExistedDependency');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When that name was be declared at require, should throw exception', done => {
        const registration = () => container.register(index_1.TYPES.ISheepName)
            .require(index_1.TYPES.ICat, () => 'FakeData')
            .deps(index_1.TYPES.ICat)
            .resolver(() => 'FakeSheepName');
        chai_1.expect(registration).to.throw(new RegExp(index_1.TYPES.ICat, 'i'));
        done();
    });
    it('When exeption is throwed somewhere in dependencies chain, should be rejected with that exeption', done => {
        container.register(index_1.TYPES.ISheepName)
            .require('Name', () => { throw 'FakeMessage'; })
            .resolver(deps => 'FakeSheepName');
        container.register(index_1.TYPES.ISheep)
            .deps(index_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container.register(index_1.TYPES.ICat)
            .deps(index_1.TYPES.ISheep)
            .resolver(deps => new Cat_1.Cat(deps.ISheep));
        container.get(index_1.TYPES.ICat)
            .then(notCallableSpy, spy)
            .then(() => {
            chai_1.expect(spy.firstCall.args[0]).to.be.equal('FakeMessage');
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
});
