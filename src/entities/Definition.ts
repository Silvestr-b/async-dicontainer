import { Declaration } from './Declaration'
import { Context } from './Context'
import { Resolver } from './Resolver'


class Definition<
   I extends {[P in keyof T]: I[P]},
   T extends {[P in keyof I]: T[P]}> {

   private decls: Declaration<I, T, keyof T>[] = [];

   constructor(
      private name: keyof T
   ){}

   addDecl(decl: Declaration<I, T, keyof T>) {
      this.decls.push(decl)
   }

   init() {
      let hasDefault = false;
      for (let i = 0; i < this.decls.length; i++) {
         if (this.decls[i].isDefault()) {
            hasDefault = true
         }
      }
      if(!hasDefault){
         throw new Error(`Default declaration for module "${this.name}" is not defined`)
      }
   }

   resolve(ctx: Context<I, T>) {
      for (let i = this.decls.length - 1; i >= 0; i--) {
         if (this.decls[i].match(ctx)) {
            return this.decls[i].resolve(ctx)
         }
      }
      throw "Matched decl not found"
   }

}


export { Definition }