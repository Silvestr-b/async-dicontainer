import { DeclarationBuilder } from './DeclarationBuilder'
import { Definition } from './Definition'
import { Declaration } from './Declaration'
import { Context } from './Context'
import { SyncPromise } from 'syncasync'
import { ResolvedDeps } from './ResolvedDeps'
import { RequiredDeps } from './RequiredDeps'
import { Resolver } from './Resolver'


class Container<
   I extends {[P in keyof T]: I[P]},
   T extends {[P in keyof I]: T[P]}> {

   private inited = false;
   private builders: DeclarationBuilder<I, T>[] = [];
   private definitions: { [name: string]: Definition<I, T> } = {};
   private singletones: { [name: string]: object } = {};

   register<N extends keyof T>(name: N) {
      if (!this.definitions[name]) {
         this.definitions[name] = new Definition<I, T>()
      }
      return this.createDeclarationBuilder(name)
   }

   // Variants of overload
   get<A extends keyof T = A, B extends keyof T = B, C extends keyof T = C>(a: A, b: B, c: C): Promise<ResolvedDeps<I, T, RequiredDeps<I, T, A, B, C>>>
   get<A extends keyof T = A, B extends keyof T = B, C extends keyof T = C>(a: A, b: B): Promise<ResolvedDeps<I, T, RequiredDeps<I, T, A, B>>>
   get<A extends keyof T = A, B extends keyof T = B, C extends keyof T = C>(a: A): Promise<I[A]>

   // Default signature
   get<A extends keyof T = A, B extends keyof T = B, C extends keyof T = C>(a: A, b?: B, c?: C): any {
      if (!this.inited) {
         this.init()
      }
      
      if(arguments.length > 1){
         const modulesNames = <Array<any>>Array.prototype.slice.call(arguments);
         return this.getSeveral(modulesNames)
      }
      
      return this.getSingle(a)
   }

   getSingle<N extends keyof T>(name: N, parentContext?: Context<I, T>): Promise<I[N]> {
      try {
         const definition = this.getDefinition(name);
         const context = new Context<I, T>(name, parentContext);

         return definition.resolve(context)
      } catch (err) {
         return SyncPromise.reject(err)
      }
   }

   private getSeveral(modulesNames: (keyof T)[]): Promise<I[keyof I]> {
      const promises: Promise<any>[] = modulesNames.map(moduleName => this.getSingle(moduleName));

      return SyncPromise.all(promises).then(deps => {
         const result = <any>{};
         deps.forEach((dep, i) => result[modulesNames[i]] = dep)
         return result
      })
   }

   private createDeclarationBuilder<N extends keyof T>(name: N) {
      const declarationBuilder = new DeclarationBuilder<I, T, N>(this, name);
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
      this.inited = true
   }

   private getDefinition(name: keyof T) {
      if (!this.definitions[name]) {
         throw new Error(`Module is not defined: ${name}`)
      }
      return this.definitions[name]
   }
}


export { Container }



