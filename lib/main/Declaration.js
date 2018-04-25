"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_1 = require("./Resolver");
class Declaration {
    constructor(container, name, requiredModules, resourceFetchers, resolver, when, whenParent, asSingleton) {
        this.container = container;
        this.name = name;
        this.requiredModules = requiredModules;
        this.resourceFetchers = resourceFetchers;
        this.resolver = resolver;
        this.when = when;
        this.whenParent = whenParent;
        this.asSingleton = asSingleton;
    }
    getName() {
        return this.name;
    }
    isDefault() {
        return this.when.length <= 0 && this.when.length <= 0;
    }
    match(ctx) {
        for (let i = 0; i < this.when.length; i++) {
            if (!this.when[i](ctx)) {
                return false;
            }
            ;
        }
        for (let i = 0; i < this.whenParent.length; i++) {
            if (!ctx.parent || !this.whenParent[i](ctx.parent)) {
                return false;
            }
            ;
        }
        return true;
    }
    resolve(ctx) {
        return this.asSingleton ? this.resolveSingleton(ctx) : this.resolveInstance(ctx);
    }
    resolveInstance(ctx) {
        return new Resolver_1.Resolver(this.container, this.requiredModules, this.resourceFetchers, this.resolver).resolve(ctx);
    }
    resolveSingleton(ctx) {
        return this.cache ? this.cache : this.cache = this.resolveInstance(ctx);
    }
}
exports.Declaration = Declaration;
