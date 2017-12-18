import { ICat } from './ICat'
import { ISheep } from './ISheep'


export interface IDog { 
   type: 'Dog'
   cat: ICat
   sheep: ISheep 
}
