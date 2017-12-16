import { Dog } from './Dog'
import { Cat } from './Cat';
import { Sheep } from './Sheep';


class DataLoader {
   // Dog
   getAsyncDog(){
      return Promise.resolve(Dog)
   }
   getSyncDog(){
      return Dog
   }

   // Cat
   getAsyncCat(){
      return Promise.resolve(Cat)
   }
   getSyncCat(){
      return Cat
   }

   // Sheep
   getAsyncSheep(){
      return Promise.resolve(Sheep)
   }
   getSyncSheep(){
      return Sheep
   }

   // SheepName
   getAsyncSheepName(){
      return Promise.resolve('AsyncDolly')
   }
   getSyncSheepName(){
      return 'SyncDolly'
   }
}


export { DataLoader }