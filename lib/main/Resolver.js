"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncasync_1 = require("syncasync");
class Resolver {
    constructor(container, requiredModules, resourceFetchers, resolver) {
        this.container = container;
        this.requiredModules = requiredModules;
        this.resourceFetchers = resourceFetchers;
        this.resolver = resolver;
        this.waiters = [];
        this.resolvedDeps = {};
    }
    resolve(ctx) {
        this.fetchDeps(ctx);
        this.fetchData();
        return syncasync_1.SyncPromise.all(this.waiters).then(results => {
            return this.resolver(this.resolvedDeps);
        });
    }
    fetchDeps(ctx) {
        for (let depName in this.requiredModules) {
            const fetchedDep = this.container.getSingle(this.requiredModules[depName], ctx);
            fetchedDep.then(depInstance => {
                this.resolvedDeps[depName] = depInstance;
            });
            this.waiters.push(fetchedDep);
        }
    }
    fetchData() {
        for (let resourceName in this.resourceFetchers) {
            const fetcher = this.resourceFetchers[resourceName];
            const fetchedResource = fetcher();
            if (syncasync_1.SyncPromise.isPromise(fetchedResource)) {
                this.waiters.push(fetchedResource);
                fetchedResource
                    .then(data => this.resolvedDeps[resourceName] = data)
                    .catch(err => err);
            }
            else {
                this.resolvedDeps[resourceName] = fetchedResource;
            }
        }
    }
}
exports.Resolver = Resolver;
