import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../Container'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('.when', () => {
   let container: Container<Interfaces, typeof TYPES>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces, typeof TYPES>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   it('When returns true, declaration should be resolved', done => {
      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .when(() => false)
         .resolver(deps => 'FirstDeclaration')

      container.register(TYPES.ISheepName)
         .when(() => true)
         .resolver(deps => 'SecondDeclaration')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('SecondDeclaration')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returns false, another declaration should be resolved', done => {
      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .when(() => true)
         .resolver(deps => 'FirstDeclaration')

      container.register(TYPES.ISheepName)
         .when(() => false)
         .resolver(deps => 'SecondDeclaration')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FirstDeclaration')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('By default returned value is true', done => {
      container.register(TYPES.ISheepName)
         .when(() => true)
         .resolver(deps => 'FirstDeclaration')

      container.register(TYPES.ISheepName)
         .resolver(deps => 'SecondDeclaration')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('SecondDeclaration')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('Context object should has current module name at "name" field', done => {
      const spy = sinon.spy(() => true)

      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .when(spy)
         .resolver(deps => 'FakeSheepName')

      container.get(TYPES.ISheepName)
         .catch(notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].name).to.be.equal(TYPES.ISheepName)
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('Context object should has context of parent module at "parent" field', done => {
      const spy = sinon.spy(() => true)
      const parentSpy = sinon.spy(() => true)

      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')
      container.register(TYPES.ISheep).resolver(deps => <any>'DefaultSheep')

      container.register(TYPES.ISheepName)
         .when(spy)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .when(parentSpy)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.get(TYPES.ISheep)
         .catch(notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].parent).to.be.equal(parentSpy.firstCall.args[0])
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

})