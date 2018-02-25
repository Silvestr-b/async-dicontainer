

export type DataFetchers<REQUIREDDATA> = {
   [P in keyof REQUIREDDATA]: () => REQUIREDDATA[P] | Promise<REQUIREDDATA[P]>
} 