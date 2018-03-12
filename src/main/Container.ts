import { SyncPromise } from 'syncasync'
import { ResolvedDeps, RequiredModules } from '../'
import { DeclarationBuilder } from './DeclarationBuilder'
import { Definition } from './Definition'
import { Declaration } from './Declaration'
import { Context } from './Context'
import { Resolver } from './Resolver'


class Container<I extends {[P in keyof I]: I[P]}> {

   private inited = false;
   private builders: DeclarationBuilder<I>[] = [];
   private definitions: { [name: string]: Definition<I> } = {};

   register<N extends keyof I>(name: N) {
      if (!this.definitions[name]) {
         this.definitions[name] = new Definition<I>(name)
      }
      return this.createDeclarationBuilder(name)
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

   private getSeveral(modulesNames: (keyof I)[]): Promise<I[keyof I]> {
      const promises: Promise<any>[] = modulesNames.map(moduleName => this.getSingle(moduleName));

      return SyncPromise.all(promises).then(deps => {
         const result = <any>{};
         deps.forEach((dep, i) => result[modulesNames[i]] = dep)
         return result
      })
   }

   private createDeclarationBuilder<N extends keyof I>(name: N) {
      const declarationBuilder = new DeclarationBuilder<I, N>(this, name);
      this.builders.push(declarationBuilder);
      return declarationBuilder
   }

   private init() {
      for (let i = 0; i < this.builders.length; i++) {
         const builder = this.builders[i];
         const declaration = builder.getDeclaration();
         const moduleName = declaration.getName();
         const definition = this.getDefinition(moduleName);

         definition.addDecl(declaration)
      }
      for (let definition in this.definitions) {
         this.definitions[definition].init()
      }
      this.inited = true
   }

   private getDefinition(name: keyof I) {
      if (!this.definitions[name]) {
         throw new Error(`Module is not defined: ${name}`)
      }
      return this.definitions[name]
   }
}


export { Container }



