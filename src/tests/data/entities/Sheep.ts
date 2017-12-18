import { ISheep } from '../interfaces/ISheep'


class Sheep implements ISheep {
   type: 'Sheep' = 'Sheep';
   constructor(
      public name: string
   ) { }
}


export { Sheep }