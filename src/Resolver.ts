import { Declaration } from './Declaration'


class Resolver<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   RESOLVEDINTERFACE=RESOLVEDINTERFACE,
   NAME=NAME,
   DATA=DATA,
   DEPS=DEPS> {

   public data: DATA;
   public instance: RESOLVEDINTERFACE;

   constructor(
      decl: Declaration<INTERFACES, TYPES, NAME>,
      public name: NAME,
      public depsResolvers: DEPS
   ) { }

   resolveData() {

   }
}


export { Resolver }