import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('.whenParent', () => {
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
         .whenParent(() => true)
         .resolver(deps => 'SecondDeclaration')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.get(TYPES.ISheep)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].name).to.be.equal('SecondDeclaration')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returns false, another declaration should be resolved', done => {
      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .whenParent(() => false)
         .resolver(deps => 'SecondDeclaration')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('DefaultSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When declared several "whenParent" callbacks, should execute all', done => {
      const whenSpy1 = sinon.spy(() => true);
      const whenSpy2 = sinon.spy(() => true);

      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .whenParent(whenSpy1)
         .whenParent(whenSpy2)
         .resolver(deps => 'SecondDeclaration')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.get(TYPES.ISheep)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].name).to.be.equal('SecondDeclaration');
            expect(whenSpy1.called).to.be.true;
            expect(whenSpy2.called).to.be.true;
            expect(notCallableSpy.notCalled).to.be.true;
         })
         .then(() => done())
   })

   it('When one of several "whenParent" callbacks return false, another declaration should be resolved', done => {
      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')

      container.register(TYPES.ISheepName)
         .whenParent(() => false)
         .whenParent(() => true)
         .resolver(deps => 'SecondDeclaration')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('DefaultSheepName');
            expect(notCallableSpy.notCalled).to.be.true;
         })
         .then(() => done())
   })

   it('When parent is existed, argument should be parent context object', done => {
      const spy = sinon.spy(() => true)
      const parentSpy = sinon.spy(() => true)

      container.register(TYPES.ISheepName).resolver(deps => 'DefaultSheepName')
      container.register(TYPES.ISheep).resolver(deps => <any>'DefaultSheep')

      container.register(TYPES.ISheepName)
         .whenParent(spy)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .when(parentSpy)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container.get(TYPES.ISheep)
         .catch(notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal(parentSpy.firstCall.args[0])
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When parent is not existed, should be resolved another declaration', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FirstDeclaration')

      container.register(TYPES.ISheepName)
         .whenParent(() => true)
         .resolver(deps => 'SecondDeclaration')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FirstDeclaration')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

})