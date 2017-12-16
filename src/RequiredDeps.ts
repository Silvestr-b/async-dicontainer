

export type RequiredDeps<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   T1 extends keyof TYPES = T1,
   T2 extends keyof TYPES = T2,
   T3 extends keyof TYPES = T3,
   T4 extends keyof TYPES = T4,
   T5 extends keyof TYPES = T5> = {
      [P in T1 | T2 | T3 | T4 | T5]: P
   } 