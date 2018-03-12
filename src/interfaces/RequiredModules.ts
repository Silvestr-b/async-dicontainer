

export type RequiredModules<
   INTERFACES extends {[P in keyof INTERFACES]: INTERFACES[P]},
   T1 extends keyof INTERFACES = T1,
   T2 extends keyof INTERFACES = T2,
   T3 extends keyof INTERFACES = T3,
   T4 extends keyof INTERFACES = T4,
   T5 extends keyof INTERFACES = T5> = {
      [P in T1 | T2 | T3 | T4 | T5]: P
   } 