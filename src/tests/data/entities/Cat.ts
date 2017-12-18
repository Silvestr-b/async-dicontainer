import { ICat } from '../interfaces/ICat'
import { ISheep } from '../interfaces/ISheep'


class Cat implements ICat {
   type: 'Cat' = 'Cat';
   constructor(
      public sheep: ISheep
   ){}
}


export { Cat }