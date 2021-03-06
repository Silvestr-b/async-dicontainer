export declare type Merged<T> = {
    [P in keyof T]: T[P];
};
export declare type RequiredResources<N extends string, R, O1 = O1> = Merged<O1 & {
    [P in N]: R;
}>;
