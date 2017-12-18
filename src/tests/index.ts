import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../Container'
import { Interfaces } from './data/interfaces/index'
import { TYPES } from './data/types/index'
import { DataLoader } from './utils/DataLoader'
import { Dog } from './data/entities/Dog'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { SyncPromise } from 'syncasync/lib/SyncPromise'



describe('DIContainer', () => {
   const loader = new DataLoader();
   let container: Container<Interfaces, typeof TYPES>;
   let spy: sinon.SinonSpy;
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      container = new Container<Interfaces, typeof TYPES>();
      spy = sinon.spy();
      notCallableSpy = sinon.spy();
   })

   describe('.get', () => {

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

   describe('.deps', () => {

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

   describe('.resolver', () => {

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

   describe('.asSingleton', () => {

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
            .then(() => {
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

   describe('.when', () => {

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

   describe('.whenParent', () => {

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

   describe('declaration matching', () => {

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

   describe('.require', () => {

      it('When throws exception, should be rejected with that exeption', done => {
         container.register(TYPES.ISheepName)
            .require('Name', () => { throw 'FakeMessage' })
            .resolver(deps => 'FakeSheepName')

         container.get(TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
               expect(spy.firstCall.args[0]).to.be.equal('FakeMessage')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

      it('When has promise, should be resolved before any resolvers', done => {
         const resolverSpy1 = sinon.spy(() => Promise.resolve(5));
         const resolverSpy2 = sinon.spy(() => Promise.resolve(5));
         const resolverSpy3 = sinon.spy(() => Promise.resolve(5));
         const resolverSpy4 = sinon.spy(() => Promise.resolve(5));
         const requireSpy1 = sinon.spy(() => Promise.resolve(5));
         const requireSpy2 = sinon.spy(() => Promise.resolve(5));
         const requireSpy3 = sinon.spy(() => Promise.resolve(5));
         const requireSpy4 = sinon.spy(() => Promise.resolve(5));

         container.register(TYPES.ISheepName)
            .require('Name', requireSpy1)
            .resolver(resolverSpy1)

         container.register(TYPES.ISheep)
            .require('Name', requireSpy2)
            .deps(TYPES.ISheepName)
            .resolver(resolverSpy2)

         container.register(TYPES.ICat)
            .require('Name', requireSpy3)
            .deps(TYPES.ISheep)
            .resolver(resolverSpy3)

         container.register(TYPES.IDog)
            .require('Name', requireSpy4)
            .deps(TYPES.ICat, TYPES.ISheep)
            .resolver(resolverSpy4)

         container.get(TYPES.IDog)
            .then(spy, notCallableSpy)
            .then(() => {
               [requireSpy1, requireSpy2, requireSpy3, requireSpy4].forEach(requireSpy => {
                  [resolverSpy1, resolverSpy2, resolverSpy3, resolverSpy4].forEach(resolverSpy => {
                     expect(requireSpy.calledBefore(resolverSpy)).to.be.true
                  })
               })
            })
            .then(() => done())
      })

      it('When data is resolved, should pass that to resolver by name', done => {
         container.register(TYPES.ISheepName)
            .require('RequiredData', () => 'FakeData')
            .resolver(spy)

         container.get(TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
               expect(spy.firstCall.args[0].RequiredData).to.be.equal('FakeData')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

      it('When declared several required callbacks, should pass all of them result to resolver by name', done => {
         container.register(TYPES.ISheepName)
            .require('RequiredData1', () => 'FakeData1')
            .require('RequiredData2', () => 'FakeData2')
            .require('RequiredData3', () => 'FakeData3')
            .resolver(spy)

         container.get(TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
               const result = spy.firstCall.args[0]
               expect(result.RequiredData1).to.be.equal('FakeData1')
               expect(result.RequiredData2).to.be.equal('FakeData2')
               expect(result.RequiredData3).to.be.equal('FakeData3')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

      it('When declared several callbacks by one name, should throw exception', done => {
         const registration = () => container.register(TYPES.ISheepName)
            .require('RequiredData', () => 'FakeData1')
            .require('RequiredData', () => 'FakeData2')
            .resolver(() => 'FakeSheepName')

         expect(registration).to.throw(/RequiredData/gi)
         done()
      })

      it('When that name was be declared at deps, should throw exception', done => {
         const registration = () => container.register(TYPES.ISheepName)
            .deps(TYPES.ICat)
            .require(TYPES.ICat, () => 'FakeData')
            .resolver(() => 'FakeSheepName')

         expect(registration).to.throw(new RegExp(TYPES.ICat, 'i'))
         done()
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
            .require('RequiredDataName', () => Promise.resolve('FakeRequiredData'))
            .resolver(spy)

         container.get(TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
               expect(spy.firstCall.args[0].RequiredDataName).to.be.equal('FakeRequiredData')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

      it('When returned value is resolved SyncPromise, should be resolved with value of that SyncPromise', done => {
         container.register(TYPES.ISheepName)
            .require('RequiredDataName', () => SyncPromise.resolve('FakeRequiredData'))
            .resolver(spy)

         container.get(TYPES.ISheepName)
            .catch(notCallableSpy)
            .then(() => {
               expect(spy.firstCall.args[0].RequiredDataName).to.be.equal('FakeRequiredData')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

      it('When returned value is rejected Promise, should be rejected with value of that Promise', done => {
         container.register(TYPES.ISheepName)
            .require('RequiredDataName', () => Promise.reject('FakeMessage'))
            .resolver(deps => deps.RequiredDataName)

         container.get(TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
               expect(spy.firstCall.args[0]).to.be.equal('FakeMessage')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

      it('When returned value is rejected SyncPromise, should be rejected with value of that SyncPromise', done => {
         container.register(TYPES.ISheepName)
            .require('RequiredDataName', () => SyncPromise.reject('FakeMessage'))
            .resolver(deps => 'FakeSheepName')

         container.get(TYPES.ISheepName)
            .then(notCallableSpy, spy)
            .then(() => {
               expect(spy.firstCall.args[0]).to.be.equal('FakeMessage')
               expect(notCallableSpy.notCalled).to.be.true
            })
            .then(() => done())
      })

   })

})

