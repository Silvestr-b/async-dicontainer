import { Declaration } from './Declaration'
import { Context } from './Context';


class Definition<
   I extends {[P in keyof T]: I[P]},
   T extends {[P in keyof I]: T[P]}> {

   private decls: Declaration<I,T, keyof T>[] = [];

   addDecl(decl: Declaration<I,T, keyof T>){
      this.decls.push(decl)
   }
   
   getResolvingGraph(ctx: Context<I,T>){
      for(let i=0; i<this.decls.length; i++){
         const decl = this.decls[i];
         if(decl.match(ctx)){
            return decl.getResolvingGraph(ctx)
         }
      }
      throw "Matched decl not found"
   }

   resolve(ctx: Context<I,T>){
      for(let i=0; i<this.decls.length; i++){
         const decl = this.decls[i];
         if(decl.match(ctx)){
            return decl.resolve(ctx)
         }
      }
      throw "Matched decl not found"
   }
}


export { Definition }