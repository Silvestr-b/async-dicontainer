import { Dog } from './Dog'
import { Cat } from './Cat';
import { Sheep } from './Sheep';


class DataLoader {
   constructor(
      private logged?: boolean,
      private duration?: boolean
   ) { }
   // Dog
   getAsyncDog() {
      this.logged && console.log('getAsyncDog');
      if(this.duration){
         return new Promise<typeof Dog>((resolve, reject) => {
            setTimeout(() => {
               resolve(Dog)
            }, 2000)
         })
      }
      return Promise.resolve(Dog)
   }
   getSyncDog() {
      this.logged && console.log('getSyncDog');
      return Dog
   }

   // Cat
   getAsyncCat() {
      this.logged && console.log('getAsyncCat');
      return Promise.resolve(Cat)
   }
   getSyncCat() {
      this.logged && console.log('getSyncCat');
      return Cat
   }

   // Sheep
   getAsyncSheep() {
      this.logged && console.log('getAsyncSheep');
      if(this.duration){
         return new Promise<typeof Sheep>((resolve, reject) => {
            setTimeout(() => {
               resolve(Sheep)
            }, 2000)
         })
      }
      return Promise.resolve(Sheep)
   }
   getSyncSheep() {
      this.logged && console.log('getSyncSheep');
      return Sheep
   }

   // SheepName
   getAsyncSheepName() {
      this.logged && console.log('getAsyncSheepName');
      return Promise.resolve('AsyncDolly');
   }
   getSyncSheepName() {
      this.logged && console.log('getSyncSheepName');
      return 'SyncDolly'
   }
}


export { DataLoader }