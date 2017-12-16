import { Context } from './Context'
import { ResolvedDeps } from './ResolvedDeps'
import { Container } from './Container'
import { RequiredDeps } from './RequiredDeps'
import { SyncPromise } from 'SyncAsync'
import { DataResolvers } from './DataResolvers'
import { Resolver } from './Resolver'


class Declaration<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   NAME extends keyof TYPES,
   RESOLVEDINTERFACE extends INTERFACES[NAME] = INTERFACES[NAME],
   REQUIREDDEPS extends RequiredDeps<INTERFACES, TYPES> = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA> = ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>> {

   private cache: RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>;

   constructor(
      private container: Container<INTERFACES, TYPES>,
      private name: NAME,
      private deps: REQUIREDDEPS,
      private dataResolvers: DataResolvers<REQUIREDDATA>,
      private resolver: (deps: ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
      private when: (ctx: Context<INTERFACES, TYPES>) => boolean,
      private whenParent: (parent: Context<INTERFACES, TYPES>) => boolean,
      private asSingleton: boolean
   ) { }

   getName(): NAME {
      return this.name
   }

   match(ctx: Context<INTERFACES, TYPES>) {
      if (this.when && !this.when(ctx)) {
         return false
      }

      if (this.whenParent && !ctx.parent) {
         return false
      }

      if (this.whenParent && ctx.parent && !this.whenParent(ctx.parent)) {
         return false
      }

      return true
   }

   getResolvingGraph(ctx: Context<INTERFACES, TYPES>){
      const resolvingGraph = {};

      for (let depName in this.deps) {
         const depGraph = this.container.getResolvingGraph(this.deps[depName], ctx);
         resolvingGraph[<string>depName] = depGraph;
      }
      
      return new Resolver(this, this.name, resolvingGraph)
   }

   resolve(ctx: Context<INTERFACES, TYPES>): RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE> {
      if (this.asSingleton) {
         return this.resolveSingleton(ctx)
      } else {
         return this.resolveInstance(ctx)
      }
   }

   private resolveInstance(ctx: Context<INTERFACES, TYPES>): RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE> {
      return this.resolveDeps(ctx).then(resolvedDeps => this.resolver(resolvedDeps))
   }

   private resolveSingleton(ctx: Context<INTERFACES, TYPES>): RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE> {
      if (this.cache) {
         return this.cache
      } else {
         return this.cache = this.resolveInstance(ctx)
      }
   }
   
   private resolveDeps(ctx: Context<INTERFACES, TYPES>) {
      const depsPromises: Promise<any>[] = [];
      const resolvedDeps = {};

      for (let depName in this.deps) {
         const dependencyPromise = this.container.get(this.deps[depName], ctx);
         depsPromises.push(dependencyPromise);
         resolvedDeps[<string>depName] = dependencyPromise;
      }

      for (let dataName in this.dataResolvers) {
         const dataPromise = SyncPromise.resolve(this.dataResolvers[dataName]());
         depsPromises.push(dataPromise);
         resolvedDeps[<string>dataName] = dataPromise
      }

      return SyncPromise.all(depsPromises).then(() => {
         const result = {};
         for (let name in resolvedDeps) {
            resolvedDeps[name].then((val) => {
               result[name] = val
            })
         }
         return <ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>>result
      })
   }
}


export { Declaration }