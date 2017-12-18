import { ICat } from '../interfaces/ICat'
import { ISheep } from '../interfaces/ISheep'
import { IDog } from '../interfaces/IDog'


class Dog implements IDog {
   type: 'Dog' = 'Dog';
   constructor(
      public cat: ICat,
      public sheep: ISheep
   ) { }
}


export { Dog }