import { Dog } from '../data/entities/Dog'
import { Cat } from '../data/entities/Cat';
import { Sheep } from '../data/entities/Sheep';


class DataLoader {
   // Dog
   getAsyncDog() {
      return Promise.resolve(Dog)
   }
   getSyncDog() {
      return Dog
   }

   // Cat
   getAsyncCat() {
      return Promise.resolve(Cat)
   }
   getSyncCat() {
      return Cat
   }

   // Sheep
   getAsyncSheep() {
      return Promise.resolve(Sheep)
   }
   getSyncSheep() {
      return Sheep
   }

   // SheepName
   getAsyncSheepName() {
      return Promise.resolve('AsyncDolly');
   }
   getSyncSheepName() {
      return 'SyncDolly'
   }
}


export { DataLoader }