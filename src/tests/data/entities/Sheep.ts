import { ISheep } from '../interfaces/ISheep'


class Sheep implements ISheep {
   type: 'Sheep' = 'Sheep';
   constructor(
      private name: string
   ) { }
}


export { Sheep }