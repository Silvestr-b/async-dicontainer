import { ISheep } from '../interfaces/ISheep';
declare class Sheep implements ISheep {
    name: string;
    type: 'Sheep';
    constructor(name: string);
}
export { Sheep };
