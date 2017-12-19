import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('declaration matching', () => {
   let container: Container<Interfaces, typeof TYPES>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces, typeof TYPES>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   it('When existed several declaration with same condition, should be resolved last of them', done => {
      container.register(TYPES.ISheepName)
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

   it('When existed several declaration with same condition, should be resolved last of them', done => {
      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .whenParent(ctx => ctx.name === TYPES.ISheep)
         .resolver(deps => 'FirstSheepName')

      container.register(TYPES.ISheepName)
         .when(ctx => ctx.name === TYPES.ISheepName)
         .resolver(deps => 'SecondSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.get(TYPES.ISheep)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].name).to.be.equal('SecondSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When not defined default declaration, should throw exception', done => {
      container.register(TYPES.ISheepName)
         .when(ctx => ctx.name === TYPES.ISheep)
         .resolver(deps => 'FakeSheepName')

      container.get(TYPES.ISheepName)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.instanceof(Error)
            expect(spy.firstCall.args[0].message).to.be.include('ISheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

})