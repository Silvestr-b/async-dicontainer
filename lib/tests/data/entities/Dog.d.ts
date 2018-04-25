import { ICat } from '../interfaces/ICat';
import { ISheep } from '../interfaces/ISheep';
import { IDog } from '../interfaces/IDog';
declare class Dog implements IDog {
    cat: ICat;
    sheep: ISheep;
    type: 'Dog';
    constructor(cat: ICat, sheep: ISheep);
}
export { Dog };
