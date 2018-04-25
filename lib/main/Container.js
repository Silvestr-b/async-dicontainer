"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const syncasync_1 = require("syncasync");
const DeclarationBuilder_1 = require("./DeclarationBuilder");
const Definition_1 = require("./Definition");
const Context_1 = require("./Context");
class Container {
    constructor() {
        this.inited = false;
        this.definitions = {};
    }
    register(moduleName) {
        const builder = this.createDeclarationBuilder(moduleName);
        const definition = this.createDefinition(moduleName);
        definition.addBuilder(builder);
        return builder;
    }
    // Default signature
    get(a, b, c) {
        if (arguments.length > 1) {
            const modulesNames = Array.prototype.slice.call(arguments);
            return this.getSeveral(modulesNames);
        }
        return this.getSingle(a);
    }
    getSingle(name, parentContext) {
        try {
            if (!this.inited) {
                this.init();
            }
            const definition = this.getDefinition(name);
            const context = new Context_1.Context(name, parentContext);
            return definition.resolve(context);
        }
        catch (err) {
            return syncasync_1.SyncPromise.reject(err);
        }
    }
    extend(container) {
        for (let definitionName in container.definitions) {
            if (this.definitions[definitionName]) {
                throw new Error(`Module name is registered in both extended containers: ${definitionName}`);
            }
            this.definitions[definitionName] = container.definitions[definitionName];
        }
        return this;
    }
    getSeveral(modulesNames) {
        const promises = modulesNames.map(moduleName => this.getSingle(moduleName));
        return syncasync_1.SyncPromise.all(promises).then(deps => {
            const result = {};
            deps.forEach((dep, i) => result[modulesNames[i]] = dep);
            return result;
        });
    }
    init() {
        for (let moduleName in this.definitions) {
            this.definitions[moduleName].init();
        }
        this.inited = true;
    }
    getDefinition(moduleName) {
        if (!this.definitions[moduleName]) {
            throw new Error(`Module is not defined: ${moduleName}`);
        }
        return this.definitions[moduleName];
    }
    createDeclarationBuilder(moduleName) {
        return new DeclarationBuilder_1.DeclarationBuilder(this, moduleName);
    }
    createDefinition(moduleName) {
        if (!this.definitions[moduleName]) {
            this.definitions[moduleName] = new Definition_1.Definition(moduleName);
        }
        return this.definitions[moduleName];
    }
}
exports.Container = Container;
