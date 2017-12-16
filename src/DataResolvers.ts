

export type DataResolvers<REQUIREDDATA> = {
   [P in keyof REQUIREDDATA]: () => Promise<REQUIREDDATA[P]>
} 