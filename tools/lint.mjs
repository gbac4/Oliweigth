// Contrôle du code avant chaque PR (ESLint).
// Les fichiers js/ sont des scripts classiques qui partagent le même espace global :
// pour chaque fichier, on déclare comme globales les noms définis par les AUTRES fichiers.
// Ainsi ESLint signale un nom déclaré deux fois (no-redeclare) et un nom inconnu (no-undef).
import {ESLint} from 'eslint';
import * as espree from 'espree';
import globals from 'globals';
import {readFileSync, readdirSync} from 'node:fs';

const files = readdirSync('js')
  .filter((f) => f.endsWith('.js'))
  .map((f) => 'js/' + f);
const opts = {ecmaVersion: 2023, sourceType: 'script'};

function topNames(code) {
  const names = [];
  for (const n of espree.parse(code, opts).body) {
    if (n.type === 'FunctionDeclaration' || n.type === 'ClassDeclaration') names.push(n.id.name);
    if (n.type === 'VariableDeclaration')
      for (const d of n.declarations) if (d.id.type === 'Identifier') names.push(d.id.name);
  }
  return names;
}
const src = Object.fromEntries(files.map((f) => [f, readFileSync(f, 'utf8')]));
const declared = Object.fromEntries(files.map((f) => [f, topNames(src[f])]));

const rules = {
  'no-redeclare': ['error', {builtinGlobals: true}],
  'no-undef': 'error',
  'no-dupe-keys': 'error',
  'no-unreachable': 'error',
  'no-self-assign': 'error',
  'no-unused-vars': ['warn', {vars: 'local', args: 'none', caughtErrors: 'none'}],
};
let errors = 0;
let warnings = 0;
for (const f of files) {
  const shared = {};
  for (const g of files) if (g !== f) for (const n of declared[g]) shared[n] = 'writable';
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {
      languageOptions: {...opts, globals: {...globals.browser, ...shared}},
      linterOptions: {reportUnusedDisableDirectives: 'off'},
      rules,
    },
  });
  const [r] = await eslint.lintText(src[f], {filePath: f});
  for (const m of r.messages) {
    const lvl = m.severity === 2 ? 'ERREUR' : 'avert.';
    console.log(`${f}:${m.line}:${m.column}  ${lvl}  ${m.message}  (${m.ruleId})`);
  }
  errors += r.errorCount;
  warnings += r.warningCount;
}
// Le service worker tourne à part : ses propres globales, rien de partagé.
{
  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: {languageOptions: {...opts, globals: globals.serviceworker}, rules},
  });
  const [r] = await eslint.lintText(readFileSync('sw.js', 'utf8'), {filePath: 'sw.js'});
  for (const m of r.messages)
    console.log(`sw.js:${m.line}:${m.column}  ${m.severity === 2 ? 'ERREUR' : 'avert.'}  ${m.message}`);
  errors += r.errorCount;
  warnings += r.warningCount;
}
console.log(`\n${errors} erreur(s), ${warnings} avertissement(s).`);
process.exit(errors ? 1 : 0);
