import { RequiredDeps } from './RequiredDeps'


export type Merged<T> = {
   [P in keyof T]: T[P]
}

export type ResolvedDeps<
   INTERFACES extends {[P in keyof TYPES]: INTERFACES[P]},
   TYPES extends {[P in keyof INTERFACES]: TYPES[P]},
   REQUIREDDEPS extends object = REQUIREDDEPS,
   REQUIREDDATA extends object = REQUIREDDATA> = Merged<{
      [P in keyof REQUIREDDEPS]: INTERFACES[P]
   } & REQUIREDDATA>
