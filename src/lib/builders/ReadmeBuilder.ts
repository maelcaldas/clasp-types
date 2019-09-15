import { PackageJson } from "../schemas/PackageJson";
import { Builder } from "./Builder";
import { ClaspJson } from "../schemas/ClaspJson";

export class ReadmeBuilder extends Builder {

  packageJson: PackageJson;
  claspJson: ClaspJson;

  constructor(packageJson: PackageJson, claspJson: ClaspJson) {
    super()
    this.packageJson = packageJson;
    this.claspJson = claspJson;
  }

  public build(): Builder {
    let date = new Date().toLocaleDateString("en-US", {year: 'numeric', month: 'long', day: 'numeric' })
    let org = this.extractOrg();
    this
    .append("# Summary").doubleLine()
    .append(`This package contains Typescript definitions for [${this.claspJson.library.name}](${this.extractHomepage()})`).doubleLine()
    .append("# Instalation").doubleLine()
    .append('### 1) Add the package:').doubleLine()
    .append('```').line()
    .append(`npm i -S ${this.packageJson.name}`).line()
    .append('```').line()
    .append('or').line()
    .append('```').line()
    .append(`yarn add --dev ${this.packageJson.name}`).line()
    .append('```').doubleLine()
    .append(`### 2) Configure tsconfig.json:`).doubleLine()
    .append('```').line()
    .append('{').line()
    .append('    "compilerOptions": {').line();
    if (org) {
      this.append(`        "typeRoots" : ["node_modules/${org}", "node_modules/@types" ]`).line();
    } else {
      this.append(`        "types" : ["${this.packageJson.name}", "google-apps-script"]`).line();
    }
    this.append('    }').line()
    .append('}').line()
    .append('```').doubleLine()
    .append('[Learn more](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types)').doubleLine()
    this.append('# Details').doubleLine()
    .append(`Generated by [clasp-types](https://github.com/maelcaldas/clasp-types) on ${date}`).doubleLine()
    return this;
  }

  extractOrg(): string | null {
    if (this.packageJson.name.startsWith('@')) {
      return this.packageJson.name.split('/')[0]
    }
    return null;
  }

  extractHomepage(): string {
    if (this.packageJson.homepage) {
      return this.packageJson.homepage
    }
    if (this.packageJson.repository) {
      if (typeof this.packageJson.repository === 'string') {
        return this.packageJson.repository;
      } else {
        return this.packageJson.repository.url.replace('\\.git', '');
      }
    }
    return 'https://developers.google.com/apps-script/guides/libraries';
  }
}