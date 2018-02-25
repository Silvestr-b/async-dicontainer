

class Context<
   I extends {[P in keyof T]: I[P]},
   T extends {[P in keyof I]: T[P]}> {

   constructor(
      public name: keyof T,
      public parent?: Context<I, T>
   ) { }

}


export { Context }