

export type RequiredModules<
   INTERFACES extends {[P in keyof INTERFACES]: INTERFACES[P]},
   T1 extends keyof INTERFACES = T1,
   T2 extends keyof INTERFACES = T2,
   T3 extends keyof INTERFACES = T3,
   T4 extends keyof INTERFACES = T4,
   T5 extends keyof INTERFACES = T5,
   T6 extends keyof INTERFACES = T6,
   T7 extends keyof INTERFACES = T7,
   T8 extends keyof INTERFACES = T8,
   T9 extends keyof INTERFACES = T9,
   T10 extends keyof INTERFACES = T10> = {
      [P in T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10]: P
   } 