import { ICat } from '../interfaces/ICat';
import { ISheep } from '../interfaces/ISheep';
declare class Cat implements ICat {
    sheep: ISheep;
    type: 'Cat';
    constructor(sheep: ISheep);
}
export { Cat };
