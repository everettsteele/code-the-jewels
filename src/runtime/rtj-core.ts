const modules: Record<string, Record<string, Function>> = {};

function registerModule(name: string, fns: Record<string, Function>) {
  modules[name] = fns;
}

function talk(value: unknown): void {
  console.log(value);
}

import * as bkText from './bk-text';
import * as bkParse from './bk-parse';
import * as atlData from './atl-data';
import * as atlFlow from './atl-flow';

registerModule('bk:text', bkText);
registerModule('bk:parse', bkParse);
registerModule('atl:data', atlData);
registerModule('atl:flow', atlFlow);

module.exports = { talk, modules };
