

export type DataFetchers<REQUIREDDATA> = {
   [P in keyof REQUIREDDATA]: () => Promise<REQUIREDDATA[P]>
} 