import { SyncPromise } from 'syncasync'
import { ResolvedDeps, RequiredModules } from '../'
import { DeclarationBuilder } from './DeclarationBuilder'
import { Definition } from './Definition'
import { Declaration } from './Declaration'
import { Context } from './Context'
import { Resolver } from './Resolver'


class Container<I extends {[P in keyof I]: I[P]}> {

   private inited = false;
   private definitions: { [name: string]: Definition<I> } = {};

   register = <N extends keyof I>(moduleName: N) => {
      const builder = this.createDeclarationBuilder(moduleName);
      const definition = this.createDefinition(moduleName);

      definition.addBuilder(builder);

      return builder
   }

   // Variants of overload
   get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A, b: B, c: C): Promise<ResolvedDeps<I, RequiredModules<I, A, B, C>>>
   get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A, b: B): Promise<ResolvedDeps<I, RequiredModules<I, A, B>>>
   get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A): Promise<I[A]>

   // Default signature
   get<A extends keyof I = A, B extends keyof I = B, C extends keyof I = C>(a: A, b?: B, c?: C): any {
      if (arguments.length > 1) {
         const modulesNames = <Array<any>>Array.prototype.slice.call(arguments);
         return this.getSeveral(modulesNames)
      }

      return this.getSingle(a)
   }

   getSingle<N extends keyof I>(name: N, parentContext?: Context<I>): Promise<I[N]> {
      try {
         if (!this.inited) {
            this.init()
         }

         const definition = this.getDefinition(name);
         const context = new Context<I>(name, parentContext);

         return definition.resolve(context)
      } catch (err) {
         return SyncPromise.reject(err)
      }
   }

   extend<I2 extends {[P in keyof I2]: any}>(container: Container<I2>): Container<I & I2> {
      for (let definitionName in container.definitions) {
         if (this.definitions[definitionName]) {
            throw new Error(`Module name is registered in both extended containers: ${definitionName}`)
         }
         this.definitions[definitionName] = container.definitions[definitionName]
      }
      return <Container<I & I2>>this
   }

   private getSeveral(modulesNames: (keyof I)[]): Promise<I[keyof I]> {
      const promises: Promise<any>[] = modulesNames.map(moduleName => this.getSingle(moduleName));

      return SyncPromise.all(promises).then(deps => {
         const result = <any>{};
         deps.forEach((dep, i) => result[modulesNames[i]] = dep)
         return result
      })
   }

   private init() {
      for (let moduleName in this.definitions) {
         this.definitions[moduleName].init()
      }
      this.inited = true
   }

   private getDefinition(moduleName: keyof I) {
      if (!this.definitions[moduleName]) {
         throw new Error(`Module is not defined: ${moduleName}`)
      }
      return this.definitions[moduleName]
   }

   private createDeclarationBuilder<N extends keyof I>(moduleName: N) {
      return new DeclarationBuilder<I, N>(this, moduleName);
   }

   private createDefinition<N extends keyof I>(moduleName: N) {
      if (!this.definitions[moduleName]) {
         this.definitions[moduleName] = new Definition<I>(moduleName);
      }
      return this.definitions[moduleName]
   }
}


export { Container }