import { Context } from './Context'
import { ResolvedDeps } from './ResolvedDeps'
import { Container } from './Container'
import { RequiredDeps } from './RequiredDeps'
import { SyncPromise } from 'syncasync'
import { DataFetchers } from './DataFetchers'
import { Resolver } from './Resolver'


class Declaration<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   NAME extends keyof TYPES,
   RESOLVEDINTERFACE extends INTERFACES[NAME]= INTERFACES[NAME],
   REQUIREDDEPS extends RequiredDeps<INTERFACES, TYPES> = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA> = ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>> {

   private cache: RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>;

   constructor(
      private container: Container<INTERFACES, TYPES>,
      private name: NAME,
      private deps: REQUIREDDEPS,
      private dataFetchers: DataFetchers<REQUIREDDATA>,
      private resolver: (deps: ResolvedDeps<INTERFACES, TYPES, REQUIREDDEPS, REQUIREDDATA>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
      private when: (ctx: Context<INTERFACES, TYPES>) => boolean,
      private whenParent: (parent: Context<INTERFACES, TYPES>) => boolean,
      private asSingleton: boolean
   ) { }

   getName(): NAME {
      return this.name
   }

   isDefault() {
      return !this.when && !this.whenParent
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

   resolve(ctx: Context<INTERFACES, TYPES>) {
      return this.asSingleton ? this.resolveSingleton(ctx) : this.resolveInstance(ctx)
   }

   private resolveInstance(ctx: Context<INTERFACES, TYPES>) {
      return this.createResolver(ctx).resolve();
   }

   private resolveSingleton(ctx: Context<INTERFACES, TYPES>) {
      return this.cache ? this.cache : this.cache = this.resolveInstance(ctx)
   }

   private createResolver(ctx: Context<INTERFACES, TYPES>) {
      const depsWaiters = <any>{};

      for (let depName in this.deps) {
         depsWaiters[depName] = this.container.getSingle(this.deps[depName], ctx);
      }

      return new Resolver<INTERFACES, TYPES, NAME>(depsWaiters, this.dataFetchers, this.resolver);
   }
}


export { Declaration }