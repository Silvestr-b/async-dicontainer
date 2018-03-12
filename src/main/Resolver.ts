import { SyncPromise } from 'syncasync'
import { RequiredModules, ResolvedDeps, ResourceFetchers } from '../'
import { Declaration } from './Declaration'
import { Container } from './Container'
import { Context } from './Context'


class Resolver<
   INTERFACES extends {[P in keyof INTERFACES]: any},
   NAME extends keyof INTERFACES,
   RESOLVEDINTERFACE extends INTERFACES[NAME]= INTERFACES[NAME],
   REQUIREDMODULES extends RequiredModules<INTERFACES> = REQUIREDMODULES,
   REQUIREDRESOURCES extends object = REQUIREDRESOURCES,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES> = ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>> {

   private waiters: Promise<any>[] = [];
   private resolvedDeps: RESOLVEDDEPS = <RESOLVEDDEPS>{};
      
   constructor(
      private container: Container<INTERFACES>,
      private requiredModules: {[P in keyof REQUIREDMODULES]: Promise<REQUIREDMODULES[P]> },
      private resourceFetchers: ResourceFetchers<REQUIREDRESOURCES>,
      private resolver: (deps: ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
   ) { }

   resolve(ctx: Context<INTERFACES>) {
      this.fetchDeps(ctx);
      this.fetchData();

      return SyncPromise.all(this.waiters).then(results => {
         return this.resolver(this.resolvedDeps)
      })
   }

   private fetchDeps(ctx: Context<INTERFACES>){
      for (let depName in this.requiredModules) {
         const fetchedDep = this.container.getSingle(this.requiredModules[depName], ctx);
         fetchedDep.then(depInstance => {
            this.resolvedDeps[depName] = depInstance;
         });
         this.waiters.push(fetchedDep);
      }
   }

   private fetchData(){
      for (let resourceName in this.resourceFetchers) {
         const fetcher = this.resourceFetchers[resourceName];
         const fetchedResource = fetcher();

         if (SyncPromise.isPromise(fetchedResource)) {
            this.waiters.push(<Promise<any>>fetchedResource);
            (<Promise<any>>fetchedResource)
               .then(data => this.resolvedDeps[resourceName] = data)
               .catch(err => err);
         } else {
            this.resolvedDeps[<any>resourceName] = fetchedResource
         }
      }
   }

}


export { Resolver }