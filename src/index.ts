import { Container } from './Container'
import { inspect } from 'util'
import { IDog } from './tests/data/interfaces/IDog'
import { ICat } from './tests/data/interfaces/ICat'
import { ISheep } from './tests/data/interfaces/ISheep'
import { DataLoader } from './tests/utils/DataLoader';


enum TYPES {
   ISheepName = 'ISheepName',
   IDog = 'IDog',
   ICat = 'ICat',
   ISheep = 'ISheep'
}

interface Interfaces {
   ISheepName: string
   IDog: IDog
   ICat: ICat
   ISheep: ISheep
}

const loader = new DataLoader();
const container = new Container<Interfaces, typeof TYPES>();


// ISheepName
container.register(TYPES.ISheepName)
   .require('SheepName', () => loader.getAsyncSheepName())
   .resolver(deps => deps.SheepName)

container.register(TYPES.ISheepName)
   .require('SheepName', () => loader.getSyncSheepName())
   .whenParent(ctx => !!ctx.parent && ctx.parent.name === TYPES.ICat)
   .resolver(deps => deps.SheepName)


// ICat
container.register(TYPES.ICat)
   .deps(TYPES.ISheep)
   .require('Cat', () => loader.getAsyncCat())
   .resolver(deps => new deps.Cat(deps.ISheep))


// ISheep   
container.register(TYPES.ISheep)
   .deps(TYPES.ISheepName)
   .require('Sheep', () => loader.getAsyncSheep())
   .resolver(deps => new deps.Sheep(deps.ISheepName))


// IDog
container.register(TYPES.IDog)
   .deps(TYPES.ICat, TYPES.ISheep)
   .require('Dog', () => loader.getAsyncDog())
   .resolver(deps => new deps.Dog(deps.ICat, deps.ISheep))
   .asSingleton()




// import * as ts from "typescript";

// function compile(fileNames: string[], options: ts.CompilerOptions): void {
//    let program = ts.createProgram(fileNames, options);
//    // console.log(ts.getPreEmitDiagnostics(program).map(d => d.messageText === 'Type \'0\' is not assignable to type \'string\'.'))
//    console.log(program.getSemanticDiagnostics().map(d => d.messageText))
// }

// compile(["./src/Context.ts"], {
//    noEmitOnError: true, noImplicitAny: true,
//    target: ts.ScriptTarget.ES5, module: ts.ModuleKind.CommonJS
// });

// container.get(TYPES.ICat);
container.get(TYPES.IDog).then(instance => {
   console.log(instance)
}, err => console.log(err))   
container.get(TYPES.IDog, TYPES.ICat).then(list => {
   console.log(list)
}, err => console.log(err))



   // let promises: Promise<any>[] = [];
   // console.time('1')
   // for(let i=0; i<20000; i++){
   //    promises.push(container.get(TYPES.IDog))
   // }
   // Promise.all(promises).then(() => {
   //    console.timeEnd('1')   
   // })

   // (async () => {
   //    const dog1 = await container.get('IDog');
   //    const dog2 = await container.get('IDog');
   //    console.log(dog1 === dog2)
   // })()

   // ; (async () => {
   //    // console.log('start')
   //    // container.get(TYPES.ICat).then(res => console.log(res))
   //    // console.log('finish')
   //    const { IDog, ICat, ISheep } = await container.getSeveral(TYPES.IDog, TYPES.ICat, TYPES.ISheep);
   //    console.log(IDog)
   //    console.log(ICat)
   //    console.log(ISheep)
   // })();

// container.getSeveral(TYPES.IDog, TYPES.ICat, TYPES.ISheep).then(modules => {
//    console.log(inspect(modules, { breakLength: 10 }))
//    console.log('Finished')
// })
// console.log('Started')



