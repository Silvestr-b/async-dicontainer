import { Declaration } from './Declaration'
import { Context } from './Context'
import { Resolver } from './Resolver'


class Definition<
   I extends {[P in keyof T]: I[P]},
   T extends {[P in keyof I]: T[P]}> {

   private decls: Declaration<I,T, keyof T>[] = [];

   addDecl(decl: Declaration<I,T, keyof T>){
      this.decls.push(decl)
   }
   
   getResolver(ctx: Context<I,T>){
      for(let i=0; i<this.decls.length; i++){
         if(this.decls[i].match(ctx)){
            return this.decls[i].getResolver(ctx)
         }
      }
      throw "Matched decl not found"
   }

}


export { Definition }