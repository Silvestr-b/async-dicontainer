import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'


describe('.get', () => {
   let container: Container<Interfaces>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   it('When module is not registered, should be rejected with that exception', done => {
      container.get(TYPES.ISheepName)
         .then(notCallableSpy, spy)
         .then(() => {
            expect(spy.firstCall.args[0]).to.be.instanceof(Error)
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When one module name is passed, should be resolved with value that was returned by resolver', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.get(TYPES.ISheepName)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.calledWith('FakeSheepName')).to.be.true
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When several names is passed, should be resolved with values by name', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISomeString)
         .resolver(deps => 'FakeString')

      container.get(TYPES.ISheepName, TYPES.ISomeString)
         .then(spy, notCallableSpy)
         .then(() => {
            expect(spy.firstCall.args[0].ISheepName).to.be.equal('FakeSheepName')
            expect(spy.firstCall.args[0].ISomeString).to.be.equal('FakeString')
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When declaration or dependency declaration do not has Promises or SyncPromises, should return SyncPromise', done => {
      container.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .require('Fake', () => 'FakeString')
         .resolver(deps => new Sheep(deps.ISheepName))

      expect(container.get(TYPES.ISheepName)).to.be.instanceof(SyncPromise)
      expect(container.get(TYPES.ISheep)).to.be.instanceof(SyncPromise)
      done()
   })

   it('When declaration or dependency declaration do not has Promises but has SyncPromises, should return SyncPromise', done => {
      container.register(TYPES.ISomeString)
         .require('Fake', () => SyncPromise.resolve('FakeString'))
         .resolver(deps => 'FakeString')

      container.register(TYPES.ISheepName)
         .resolver(deps => SyncPromise.resolve('FakeSheepName'))

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      expect(container.get(TYPES.ISomeString)).to.be.instanceof(SyncPromise)
      expect(container.get(TYPES.ISheepName)).to.be.instanceof(SyncPromise)
      expect(container.get(TYPES.ISheep)).to.be.instanceof(SyncPromise)
      done()
   })

   it('When declaration or dependency declaration has Promise, should return Promise', done => {
      container.register(TYPES.ISomeString)
         .require('Fake', () => Promise.resolve('FakeString'))
         .resolver(deps => 'FakeString')

      container.register(TYPES.ISheepName)
         .resolver(deps => Promise.resolve('FakeSheepName'))

      container.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      expect(container.get(TYPES.ISomeString)).to.be.instanceof(Promise)
      expect(container.get(TYPES.ISheepName)).to.be.instanceof(Promise)
      expect(container.get(TYPES.ISheep)).to.be.instanceof(Promise)
      done()
   })

})