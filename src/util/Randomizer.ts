export default class Randomizer{
    static randomEntry<T>(array: T[] | undefined): T | undefined{
        if(array === undefined || array.length == 0) return undefined;
        return array[Math.floor(Math.random() * array.length)];
    }
}