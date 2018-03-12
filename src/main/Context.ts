

class Context<I extends {[P in keyof I]: I[P]}> {

   constructor(
      public name: keyof I,
      public parent?: Context<I>
   ) { }

}


export { Context }