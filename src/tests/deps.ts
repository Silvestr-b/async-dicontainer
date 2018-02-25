import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('.deps', () => {
   let container: Container<Interfaces, typeof TYPES>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces, typeof TYPES>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   it('When dependencies for module is declared, should resolve and pass to resolver deps by name', done => {
      container.register(TYPES.ISomeString)
         .resolver(deps => 'FakeString')

      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName, TYPES.ISomeString)
         .resolver(spy)

      container.get(TYPES.ISheep)
         .catch(notCallableSpy)
         .then(() => {
            const result = spy.firstCall.args[0]
            expect(result.ISheepName).to.be.equal('FakeSheepName')
            expect(result.ISomeString).to.be.equal('FakeString')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When dependencies have own dependencies, should recursively resolve all dependency', done => {
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

      container.get(TYPES.IDog)
         .then(spy, notCallableSpy)
         .then(() => {
            const result = spy.firstCall.args[0]
            expect(result).to.be.instanceOf(Dog)
            expect(result.sheep).to.be.instanceOf(Sheep)
            expect(result.sheep.name).to.be.string
            expect(result.cat).to.be.instanceOf(Cat)
            expect(result.cat.sheep).to.be.instanceOf(Sheep)
            expect(result.cat.sheep.name).to.be.string
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When dependency is not declared, should be rejected with exeption', done => {
      container.register(TYPES.ISheepName)
         .deps(<any>'NotExistedDependency')
         .resolver(deps => 'FakeSheepName')

      container.get(TYPES.ISheepName)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.instanceOf(Error)
            expect(spy.firstCall.args[0].message).to.be.include('NotExistedDependency')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When that name was be declared at require, should throw exception', done => {
      const registration = () => container.register(TYPES.ISheepName)
         .require(TYPES.ICat, () => 'FakeData')
         .deps(TYPES.ICat)
         .resolver(() => 'FakeSheepName')

      expect(registration).to.throw(new RegExp(TYPES.ICat, 'i'))
      done()
   })

   it('When exeption is throwed somewhere in dependencies chain, should be rejected with that exeption', done => {
      container.register(TYPES.ISheepName)
         .require('Name', () => { throw 'FakeMessage' })
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.register(TYPES.ICat)
         .deps(TYPES.ISheep)
         .resolver(deps => new Cat(deps.ISheep))

      container.get(TYPES.ICat)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeMessage')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

})