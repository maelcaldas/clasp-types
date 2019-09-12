import { Builder } from "./builders/Builder";
import { TypedocKind, TypedocComment, TypedocType, TypedocSignature, TypedocParameter } from "./schemas/TypedocJson";

export abstract class Definition {

  protected kind: TypedocKind;
  protected depth: number;

  constructor(kind: TypedocKind, depth: number) {
    this.kind = kind;
    this.depth = depth;
  }

  protected ident() {
    return " ".repeat(this.depth * 2);
  }

  protected tab() {
    return this.depth+1;
  }

  abstract render(builder: Builder): void;

  protected addComment(builder: Builder, comment: TypedocComment | undefined): void {
    if (comment) {
      builder.append(`${this.ident()}/**`).line()
      if (comment.shortText) {
        builder.append(`${this.ident()} * ${this.identBreaks(comment.shortText)}`).line()
        builder.append(`${this.ident()} *`).line()
      }
      if (comment.text) {
        builder.append(`${this.ident()} * ${this.identBreaks(comment.text)}`).line()
      }
      if (comment.returns) {
        builder.append(`${this.ident()} * @returns ${this.identBreaks(comment.returns)}`).line()
      }
      builder.append(`${this.ident()} */`).line()
    }
  }

  private identBreaks(text: string): string {
    return text.replace(new RegExp("\n", 'g'), `\n${this.ident()} * `)
  }

  protected buildType(builder: Builder, type?: TypedocType): void {
    if (type) {
      if (type.type === 'union' && type.types) {
        type.types.filter(t => t.name !== 'undefined' && t.name !== 'false').forEach((t, key, arr) => {
          this.buildType(builder, t)
          if (!Object.is(arr.length - 1, key)) {
            //Last item
            builder.append(' | ')
          }
        });
        return
      } else if (type.type === 'array') {
        this.buildType(builder, type.elementType);
        builder.append('[]')
        return
      } else if (type.type === 'reflection' && type.declaration && type.declaration.signatures && type.declaration.signatures.length > 0) {
        let signature = type.declaration.signatures[0];
        builder.append('(')
        this.buildParams(builder, signature)
        builder.append(')')
        builder.append(' => ')
        this.buildType(builder, signature.type)
        return;
      }
      builder.append(type.name === 'true' ? 'boolean' : type.name);
    }
  }  

  protected buildParams(builder: Builder, signature: TypedocSignature) {
    if (signature.parameters) {
      signature.parameters.forEach((param, key, arr) => {
        this.buildParam(builder, param)
        if (!Object.is(arr.length - 1, key)) {
          //Last item
          builder.append(', ')
        }
      });
    }
  }

  protected buildParam(builder: Builder, param: TypedocParameter): void {
    let sep = param.flags.isOptional ? '?:' : ':';
    builder.append(param.name).append(sep).append(' ');
    this.buildType(builder, param.type);
  }
    
}