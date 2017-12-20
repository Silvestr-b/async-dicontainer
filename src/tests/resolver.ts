import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('.resolver', () => {
   let container: Container<Interfaces, typeof TYPES>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces, typeof TYPES>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   it('When more than one resolver defined, should throw exception', done => {
      const registration = () => {
         container.register(TYPES.ISheepName)
            .resolver(deps => 'FakeSheepNameOne')
            .resolver(deps => 'FakeSheepNameTwo')
      }

      expect(registration).to.be.throw(/duplicate resolver declaration/gi)
      done()
   })

   it('When resolver throw exception, should be rejected with that exeption', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => { throw 'FakeMessage' })

      container.get(TYPES.ISheepName)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeMessage')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When declaration has deps and requires, should pass all by names', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .require('Sheep', () => Sheep)
         .resolver(spy)

      container.get(TYPES.ISheep)
         .catch(notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].ISheepName).to.be.equal('FakeSheepName')
            expect(spy.firstCall.args[0].Sheep).to.be.equal(Sheep)
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returned value is value, should be resolved with that value', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returned value is resolved Promise, should be resolved with value of that Promise', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => Promise.resolve('FakeSheepName'))

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returned value is resolved SyncPromise, should be resolved with value of that SyncPromise', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => SyncPromise.resolve('FakeSheepName'))

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returned value is rejected Promise, should be rejected with value of that Promise', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => Promise.reject('FakeSheepName'))

      container.get(TYPES.ISheepName)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When returned value is rejected SyncPromise, should be rejected with value of that SyncPromise', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => SyncPromise.reject('FakeSheepName'))

      container.get(TYPES.ISheepName)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.equal('FakeSheepName')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

})