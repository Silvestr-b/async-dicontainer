import { Declaration } from './Declaration'
import { Context } from './Context'
import { Resolver } from './Resolver'
import { DeclarationBuilder } from './DeclarationBuilder';


class Definition<I extends {[P in keyof I]: I[P]}> {

   private builders: DeclarationBuilder<I>[] = [];
   private decls: Declaration<I, keyof I>[] = [];

   constructor(
      private name: keyof I
   ){}

   addBuilder(builder: DeclarationBuilder<I>){
      this.builders.push(builder)
   }

   init() {
      let hasDefault = false;

      for (let i = 0; i < this.builders.length; i++) {
         const builder = this.builders[i];
         const decl = builder.getDeclaration();

         if (decl.isDefault()) {
            hasDefault = true
         }

         this.decls.push(decl)
      }
      
      if(!hasDefault){
         throw new Error(`Default declaration for module "${this.name}" is not defined`)
      }
   }

   resolve(ctx: Context<I>) {
      for (let i = this.decls.length - 1; i >= 0; i--) {
         if (this.decls[i].match(ctx)) {
            return this.decls[i].resolve(ctx)
         }
      }
      throw "Matched decl not found"
   }

}


export { Definition }