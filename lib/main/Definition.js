"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Definition {
    constructor(name) {
        this.name = name;
        this.builders = [];
        this.decls = [];
    }
    addBuilder(builder) {
        this.builders.push(builder);
    }
    init() {
        let hasDefault = false;
        for (let i = 0; i < this.builders.length; i++) {
            const builder = this.builders[i];
            const decl = builder.getDeclaration();
            if (decl.isDefault()) {
                hasDefault = true;
            }
            this.decls.push(decl);
        }
        if (!hasDefault) {
            throw new Error(`Default declaration for module "${this.name}" is not defined`);
        }
    }
    resolve(ctx) {
        for (let i = this.decls.length - 1; i >= 0; i--) {
            if (this.decls[i].match(ctx)) {
                return this.decls[i].resolve(ctx);
            }
        }
        throw "Matched decl not found";
    }
}
exports.Definition = Definition;
