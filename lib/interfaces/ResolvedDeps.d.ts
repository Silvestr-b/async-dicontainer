export declare type Merged<T> = {
    [P in keyof T]: T[P];
};
export declare type ResolvedDeps<INTERFACES extends {
    [P in keyof INTERFACES]: INTERFACES[P];
}, REQUIREDDEPS extends object = REQUIREDDEPS, REQUIREDDATA extends object = REQUIREDDATA> = Merged<{
    [P in keyof REQUIREDDEPS]: INTERFACES[P];
} & REQUIREDDATA>;
