import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('.asSingleton', () => {
   let container: Container<Interfaces>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   it('When .get call is not first, should be resolved with same instance', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))
         .asSingleton()


      SyncPromise.all([
         container.get(TYPES.ISheep).then(spy, notCallableSpy),
         container.get(TYPES.ISheep).then(spy, notCallableSpy)
      ])
         .catch(notCallableSpy)
         .then((res) => {
            expect(spy.getCall(0).args[0]).to.be.equal(spy.getCall(1).args[0])
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When .get call is not first, should be resolved with same dependency instances', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.register(TYPES.ICat)
         .deps(TYPES.ISheep)
         .resolver(deps => new Cat(deps.ISheep))

      container.register(TYPES.IDog)
         .deps(TYPES.ICat, TYPES.ISheep)
         .resolver(deps => new Dog(deps.ICat, deps.ISheep))
         .asSingleton()


      SyncPromise.all([
         container.get(TYPES.IDog).then(spy, notCallableSpy),
         container.get(TYPES.IDog).then(spy, notCallableSpy)
      ])
         .catch(notCallableSpy)
         .then(() => {
            const result1 = spy.getCall(0).args[0]
            const result2 = spy.getCall(1).args[0]
            expect(result1.sheep).to.be.equal(result2.sheep)
            expect(result1.sheep.name).to.be.equal(result2.sheep.name)
            expect(result1.cat).to.be.equal(result2.cat)
            expect(result1.cat.sheep).to.be.equal(result2.cat.sheep)
            expect(result1.cat.sheep.name).to.be.equal(result2.cat.sheep.name)
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

})