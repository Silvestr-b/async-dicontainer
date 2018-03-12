import { expect } from 'chai'
import * as sinon from 'sinon'
import { Container } from '../'
import { Interfaces, ExtendedInterfaces } from './data/interfaces/index'
import { TYPES } from './data/types'
import { Cat } from './data/entities/Cat'
import { Sheep } from './data/entities/Sheep'
import { Duck } from './data/entities/Duck'


describe('.extend', () => {
   let notCallableSpy: sinon.SinonSpy

   beforeEach(() => {
      notCallableSpy = sinon.spy();
   })

   it('When extend call, container should can resolve modules of both containers', done => {
      const container1 = new Container<Interfaces>();
      const container2 = new Container<ExtendedInterfaces>()

      container1.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName')
      
      container1.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container2.register(TYPES.IDuck)
         .resolver(deps => new Duck())

      let container3 = container1.extend(container2)

      Promise.all([
         container3.get(TYPES.ISheep),
         container3.get(TYPES.IDuck)
      ]).catch(notCallableSpy)
         .then((res) => {
            expect(res[0]).to.be.instanceOf(Sheep)
            expect(res[1]).to.be.instanceOf(Duck)
            expect(notCallableSpy.notCalled).to.be.true
         })
         .then(() => done())
   })

   it('When both extended containers have one module name, should throw Exception', done => {
      const container1 = new Container<Interfaces>();
      const container2 = new Container<Interfaces>()

      container1.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName1')
      
      container1.register(TYPES.ISheep)
         .deps(TYPES.ISheepName)
         .resolver(deps => new Sheep(deps.ISheepName))

      container2.register(TYPES.ISheepName)
         .resolver(deps => 'FakeSheepName2')

      expect(() => container1.extend(container2)).to.throw('Module name is registered in both extended containers');
      done()
   })

})

