"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon = require("sinon");
const _1 = require("../");
const types_1 = require("./data/types");
const Sheep_1 = require("./data/entities/Sheep");
const Duck_1 = require("./data/entities/Duck");
describe('.extend', () => {
    let notCallableSpy;
    beforeEach(() => {
        notCallableSpy = sinon.spy();
    });
    it('When extend call, container should can resolve modules of both containers', done => {
        const container1 = new _1.Container();
        const container2 = new _1.Container();
        container1.register(types_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName');
        container1.register(types_1.TYPES.ISheep)
            .deps(types_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container2.register(types_1.TYPES.IDuck)
            .resolver(deps => new Duck_1.Duck());
        let container3 = container1.extend(container2);
        Promise.all([
            container3.get(types_1.TYPES.ISheep),
            container3.get(types_1.TYPES.IDuck)
        ]).catch(notCallableSpy)
            .then((res) => {
            chai_1.expect(res[0]).to.be.instanceOf(Sheep_1.Sheep);
            chai_1.expect(res[1]).to.be.instanceOf(Duck_1.Duck);
            chai_1.expect(notCallableSpy.notCalled).to.be.true;
        })
            .then(() => done());
    });
    it('When both extended containers have one module name, should throw Exception', done => {
        const container1 = new _1.Container();
        const container2 = new _1.Container();
        container1.register(types_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName1');
        container1.register(types_1.TYPES.ISheep)
            .deps(types_1.TYPES.ISheepName)
            .resolver(deps => new Sheep_1.Sheep(deps.ISheepName));
        container2.register(types_1.TYPES.ISheepName)
            .resolver(deps => 'FakeSheepName2');
        chai_1.expect(() => container1.extend(container2)).to.throw('Module name is registered in both extended containers');
        done();
    });
});
