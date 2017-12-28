import { SyncPromise } from 'syncasync'
import { RequiredDeps, ResolvedDeps, DataFetchers } from '../'
import { Declaration } from './Declaration'
import { Container } from './Container'
import { Context } from './Context'


class Resolver<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   NAME extends keyof TYPES,
   RESOLVEDINTERFACE extends INTERFACES[NAME]= INTERFACES[NAME],
   REQUIREDDEPS extends RequiredDeps<INTERFACES, TYPES> = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA> = ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>> {

   private waiters: Promise<any>[] = [];
   private resolvedDeps: RESOLVEDDEPS = <RESOLVEDDEPS>{};
      
   constructor(
      private container: Container<INTERFACES,TYPES>,
      private deps: {[P in keyof REQUIREDDEPS]: Promise<REQUIREDDEPS[P]> },
      private dataFetchers: DataFetchers<REQUIREDDATA>,
      private resolver: (deps: ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
   ) { }

   resolve(ctx: Context<INTERFACES, TYPES>) {
      this.fetchDeps(ctx);
      this.fetchData();

      return SyncPromise.all(this.waiters).then(results => {
         return this.resolver(this.resolvedDeps)
      })
   }

   private fetchDeps(ctx: Context<INTERFACES, TYPES>){
      for (let depName in this.deps) {
         const fetchedDep = this.container.getSingle(this.deps[depName], ctx);
         fetchedDep.then(depInstance => {
            this.resolvedDeps[depName] = depInstance;
         });
         this.waiters.push(fetchedDep);
      }
   }

   private fetchData(){
      for (let dataName in this.dataFetchers) {
         const fetcher = this.dataFetchers[dataName];
         const fetchedData = fetcher();

         if (SyncPromise.isPromise(fetchedData)) {
            this.waiters.push(fetchedData);
            (<Promise<any>>fetchedData)
               .then(data => this.resolvedDeps[dataName] = data)
               .catch(err => err);
         } else {
            this.resolvedDeps[dataName] = fetchedData
         }
      }
   }

}


export { Resolver }