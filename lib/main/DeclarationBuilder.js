"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Declaration_1 = require("./Declaration");
class DeclarationBuilder {
    constructor(container, name) {
        this.container = container;
        this.name = name;
        this._requiredModules = {};
        this._resourceFethers = {};
        this._asSingleton = false;
        this._when = [];
        this._whenParent = [];
    }
    // Default
    deps(a, b, c) {
        for (let i = 0; i < arguments.length; i++) {
            const name = arguments[i];
            if (this._resourceFethers[name]) {
                throw new Error(`Duplicate dependency name with required data name: ${name}`);
            }
            this._requiredModules[name] = name;
        }
        return this;
    }
    resolver(cb) {
        if (this._resolver) {
            throw new Error(`Duplicate resolver declaration for module: ${this.name}`);
        }
        this._resolver = cb;
        return this;
    }
    when(cb) {
        this._when.push(cb);
        return this;
    }
    whenParent(cb) {
        this._whenParent.push(cb);
        return this;
    }
    require(name, cb) {
        if (this._resourceFethers[name]) {
            throw new Error(`Duplicate required data name: ${name}`);
        }
        if (this._requiredModules[name]) {
            throw new Error(`Duplicate required data name with dependency name: ${name}`);
        }
        this._resourceFethers[name] = cb;
        return this;
    }
    asSingleton() {
        this._asSingleton = true;
        return this;
    }
    getDeclaration() {
        if (!this._resolver) {
            throw new Error(`Resolver is not defined for module: ${this.name}`);
        }
        return new Declaration_1.Declaration(this.container, this.name, this._requiredModules, this._resourceFethers, this._resolver, this._when, this._whenParent, this._asSingleton);
    }
}
exports.DeclarationBuilder = DeclarationBuilder;
