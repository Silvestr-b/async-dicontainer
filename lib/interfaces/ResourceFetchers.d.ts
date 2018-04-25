export declare type ResourceFetchers<REQUIREDRESOURCES> = {
    [P in keyof REQUIREDRESOURCES]: () => REQUIREDRESOURCES[P] | Promise<REQUIREDRESOURCES[P]>;
};
