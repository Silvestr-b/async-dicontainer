import { ICat } from '../interfaces/ICat'
import { ISheep } from '../interfaces/ISheep'
import { IDog } from '../interfaces/IDog'


class Dog implements IDog {
   type: 'Dog' = 'Dog';
   constructor(
      private cat: ICat,
      private sheep: ISheep
   ) { }
   sayHi(){
      return 'wouf'
   }
}


export { Dog }