import { IDog } from './IDog'
import { ICat } from './ICat'
import { ISheep } from './ISheep'
import { IDuck } from './IDuck'


export interface Interfaces {
   ISomeString: string
   ISheepName: string
   IDog: IDog
   ICat: ICat
   ISheep: ISheep
}

export interface ExtendedInterfaces {
   IDuck: IDuck;
}