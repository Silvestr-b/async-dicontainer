import { RequiredModules, ResolvedDeps, ResourceFetchers } from '../'
import { Context } from './Context'
import { Container } from './Container'
import { SyncPromise } from 'syncasync'
import { Resolver } from './Resolver'


class Declaration<
   INTERFACES extends {[P in keyof INTERFACES]: any},
   NAME extends keyof INTERFACES,
   RESOLVEDINTERFACE extends INTERFACES[NAME]= INTERFACES[NAME],
   REQUIREDMODULES extends RequiredModules<INTERFACES> = REQUIREDMODULES,
   REQUIREDRESOURCES extends object = REQUIREDRESOURCES,
   RESOLVEDDEPS extends ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES> = ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>> {

   private cache?: Promise<RESOLVEDINTERFACE>;

   constructor(
      private container: Container<INTERFACES>,
      private name: NAME,
      private requiredModules: REQUIREDMODULES,
      private resourceFetchers: ResourceFetchers<REQUIREDRESOURCES>,
      private resolver: (deps: ResolvedDeps<INTERFACES, REQUIREDMODULES, REQUIREDRESOURCES>) => RESOLVEDINTERFACE | Promise<RESOLVEDINTERFACE>,
      private when: ((context: Context<INTERFACES>) => boolean)[],
      private whenParent: ((parent: Context<INTERFACES>) => boolean)[],
      private asSingleton: boolean
   ) { }

   getName(): NAME {
      return this.name
   }

   isDefault() {
      return this.when.length <= 0 && this.when.length <= 0
   }

   match(ctx: Context<INTERFACES>) {
      for (let i = 0; i < this.when.length; i++) {
         if (!this.when[i](ctx)) {
            return false
         };
      }

      for (let i = 0; i < this.whenParent.length; i++) {
         if (!ctx.parent || !this.whenParent[i](ctx.parent)) {
            return false
         };
      }

      return true
   }

   resolve(ctx: Context<INTERFACES>) {
      return this.asSingleton ? this.resolveSingleton(ctx) : this.resolveInstance(ctx)
   }

   private resolveInstance(ctx: Context<INTERFACES>) {
      return new Resolver<INTERFACES, NAME>(this.container, this.requiredModules, this.resourceFetchers, this.resolver).resolve(ctx);
   }

   private resolveSingleton(ctx: Context<INTERFACES>) {
      return this.cache ? this.cache : this.cache = this.resolveInstance(ctx)
   }

}


export { Declaration }