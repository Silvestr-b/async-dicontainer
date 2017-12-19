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

   constructor(
      private depsWaiters: {[P in keyof REQUIREDDEPS]: Promise<REQUIREDDEPS[P]> },
      private dataFetchers: DataFetchers<REQUIREDDATA>,
      private resolvingCallback: (deps: ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
   ) { }

   resolve() {
      const requiredData = this.fetchRequiredData();
      const deps = this.resolveDeps();

      return SyncPromise.all([requiredData, deps]).then(results => {
         const resolvedDeps = Object.assign({}, results[0], results[1])
         const instance = this.resolvingCallback(resolvedDeps)

         return SyncPromise.resolve(instance)
      })
   }

   private fetchRequiredData() {
      const waiters: Promise<any>[] = [];
      const requiredData = <REQUIREDDATA>{};

      for (let dataName in this.dataFetchers) {
         const fetcher = this.dataFetchers[dataName];
         const dataFetchWaiter = SyncPromise.resolve(fetcher());

         dataFetchWaiter.then(fetchedData => {
            requiredData[dataName] = fetchedData;
         }).catch(err => err);

         waiters.push(dataFetchWaiter);
      }

      return SyncPromise.all(waiters).then(() => requiredData)
   }

   private resolveDeps() {
      const waiters: Promise<any>[] = [];
      const resolvedDeps = <RESOLVEDDEPS>{};

      for (let depName in this.depsWaiters) {
         const waiter = this.depsWaiters[depName];

         waiter.then(depInstance => {
            resolvedDeps[depName] = depInstance;
         });

         waiters.push(waiter);
      }

      return SyncPromise.all(waiters).then(() => resolvedDeps)
   }

}


export { Resolver }