import type { Monaco } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';

// Track which languages have already had providers registered to prevent duplicates
const registeredLanguages = new Set<string>();

// ─── Python ──────────────────────────────────────────────────────────────────

const PYTHON_KEYWORDS = [
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'try', 'while', 'with', 'yield',
];

const PYTHON_BUILTINS = [
  'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter',
  'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool',
  'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'delattr',
  'open', 'input', 'abs', 'max', 'min', 'sum', 'sorted', 'reversed',
  'any', 'all', 'round', 'super', 'property', 'staticmethod', 'classmethod',
  'Exception', 'ValueError', 'TypeError', 'KeyError', 'IndexError',
  'AttributeError', 'RuntimeError', 'StopIteration', 'NotImplementedError',
];

const PYTHON_SNIPPETS = [
  {
    label: 'def',
    documentation: 'Define a function',
    insertText: 'def ${1:name}(${2:args}):\n\t${3:pass}',
  },
  {
    label: 'class',
    documentation: 'Define a class',
    insertText: 'class ${1:Name}:\n\tdef __init__(self${2:, args}):\n\t\t${3:pass}',
  },
  {
    label: 'if',
    documentation: 'if statement',
    insertText: 'if ${1:condition}:\n\t${2:pass}',
  },
  {
    label: 'ifelse',
    documentation: 'if/else statement',
    insertText: 'if ${1:condition}:\n\t${2:pass}\nelse:\n\t${3:pass}',
  },
  {
    label: 'elif',
    documentation: 'elif branch',
    insertText: 'elif ${1:condition}:\n\t${2:pass}',
  },
  {
    label: 'for',
    documentation: 'for loop',
    insertText: 'for ${1:item} in ${2:iterable}:\n\t${3:pass}',
  },
  {
    label: 'while',
    documentation: 'while loop',
    insertText: 'while ${1:condition}:\n\t${2:pass}',
  },
  {
    label: 'try',
    documentation: 'try/except block',
    insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:raise}',
  },
  {
    label: 'tryfinally',
    documentation: 'try/except/finally block',
    insertText: 'try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${3:raise}\nfinally:\n\t${4:pass}',
  },
  {
    label: 'with',
    documentation: 'with/as context manager',
    insertText: "with open(${1:'file'}, ${2:'r'}) as f:\n\t${3:pass}",
  },
  {
    label: 'listcomp',
    documentation: 'List comprehension',
    insertText: '[${1:expr} for ${2:item} in ${3:iterable}]',
  },
  {
    label: 'dictcomp',
    documentation: 'Dict comprehension',
    insertText: '{${1:key}: ${2:val} for ${1:key}, ${2:val} in ${3:iterable}}',
  },
  {
    label: 'import',
    documentation: 'import statement',
    insertText: 'import ${1:module}',
  },
  {
    label: 'from',
    documentation: 'from/import statement',
    insertText: 'from ${1:module} import ${2:name}',
  },
  {
    label: 'lambda',
    documentation: 'Lambda expression',
    insertText: 'lambda ${1:args}: ${2:expr}',
  },
];

// ─── Java ─────────────────────────────────────────────────────────────────────

const JAVA_KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
  'char', 'class', 'const', 'continue', 'default', 'do', 'double',
  'else', 'enum', 'extends', 'final', 'finally', 'float', 'for',
  'if', 'implements', 'import', 'instanceof', 'int', 'interface',
  'long', 'native', 'new', 'null', 'package', 'private', 'protected',
  'public', 'return', 'short', 'static', 'super', 'switch',
  'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'true', 'false',
  'String', 'Object', 'System', 'Math',
  'ArrayList', 'LinkedList', 'HashMap', 'HashSet', 'TreeMap', 'TreeSet',
  'List', 'Map', 'Set', 'Queue', 'Deque', 'Iterator', 'Optional',
  'Collections', 'Arrays', 'StringBuilder',
  'BufferedReader', 'InputStreamReader', 'Scanner',
  'Override', 'Deprecated', 'SuppressWarnings', 'FunctionalInterface',
];

const JAVA_SNIPPETS = [
  {
    label: 'class',
    documentation: 'Public class declaration',
    insertText: 'public class ${1:Name} {\n\t${2}\n}',
  },
  {
    label: 'main',
    documentation: 'main method',
    insertText: 'public static void main(String[] args) {\n\t${1}\n}',
  },
  {
    label: 'sout',
    documentation: 'System.out.println',
    insertText: 'System.out.println(${1});',
  },
  {
    label: 'for',
    documentation: 'Classic for loop',
    insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}',
  },
  {
    label: 'foreach',
    documentation: 'Enhanced for loop',
    insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n\t${4}\n}',
  },
  {
    label: 'while',
    documentation: 'while loop',
    insertText: 'while (${1:condition}) {\n\t${2}\n}',
  },
  {
    label: 'if',
    documentation: 'if statement',
    insertText: 'if (${1:condition}) {\n\t${2}\n}',
  },
  {
    label: 'ifelse',
    documentation: 'if/else statement',
    insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}',
  },
  {
    label: 'try',
    documentation: 'try/catch block',
    insertText: 'try {\n\t${1}\n} catch (${2:Exception} e) {\n\t${3:e.printStackTrace();}\n}',
  },
  {
    label: 'tryfinally',
    documentation: 'try/catch/finally block',
    insertText: 'try {\n\t${1}\n} catch (${2:Exception} e) {\n\t${3:e.printStackTrace();}\n} finally {\n\t${4}\n}',
  },
  {
    label: 'interface',
    documentation: 'Interface declaration',
    insertText: 'public interface ${1:Name} {\n\t${2}\n}',
  },
  {
    label: 'enum',
    documentation: 'Enum declaration',
    insertText: 'public enum ${1:Name} {\n\t${2}\n}',
  },
  {
    label: 'method',
    documentation: 'Public method',
    insertText: 'public ${1:void} ${2:name}(${3}) {\n\t${4}\n}',
  },
  {
    label: 'import',
    documentation: 'import statement',
    insertText: 'import ${1:package};',
  },
];

// ─── C++ ──────────────────────────────────────────────────────────────────────

const CPP_KEYWORDS = [
  'alignas', 'alignof', 'auto', 'bool', 'break', 'case', 'catch',
  'char', 'char16_t', 'char32_t', 'class', 'const', 'constexpr',
  'const_cast', 'continue', 'decltype', 'default', 'delete', 'do',
  'double', 'dynamic_cast', 'else', 'enum', 'explicit', 'extern',
  'false', 'float', 'for', 'friend', 'goto', 'if', 'inline', 'int',
  'long', 'mutable', 'namespace', 'new', 'noexcept', 'nullptr',
  'operator', 'override', 'private', 'protected', 'public', 'register',
  'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static',
  'static_assert', 'static_cast', 'struct', 'switch', 'template',
  'this', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
  'union', 'unsigned', 'using', 'virtual', 'void', 'volatile',
  'wchar_t', 'while',
  // STL types
  'string', 'vector', 'map', 'set', 'unordered_map', 'unordered_set',
  'pair', 'tuple', 'array', 'deque', 'queue', 'stack', 'priority_queue',
  'list', 'forward_list', 'bitset', 'optional', 'variant', 'any',
  'shared_ptr', 'unique_ptr', 'weak_ptr',
  // I/O
  'cout', 'cin', 'cerr', 'endl', 'printf', 'scanf',
  // Common headers (without angle brackets – typed after #include)
  'iostream', 'fstream', 'sstream', 'string', 'vector', 'algorithm',
  'numeric', 'cmath', 'cstring', 'cstdlib', 'cstdio', 'stdexcept',
  'functional', 'memory', 'utility', 'cassert', 'climits',
  // Preprocessor
  'define', 'include', 'ifndef', 'ifdef', 'endif', 'pragma',
  // std namespace
  'std',
];

const CPP_SNIPPETS = [
  {
    label: '#include',
    documentation: '#include directive',
    insertText: '#include <${1:iostream}>',
  },
  {
    label: 'main',
    documentation: 'int main entry point',
    insertText: 'int main() {\n\t${1}\n\treturn 0;\n}',
  },
  {
    label: 'mainargs',
    documentation: 'int main with args',
    insertText: 'int main(int argc, char* argv[]) {\n\t${1}\n\treturn 0;\n}',
  },
  {
    label: 'cout',
    documentation: 'std::cout print',
    insertText: 'std::cout << ${1} << std::endl;',
  },
  {
    label: 'cin',
    documentation: 'std::cin input',
    insertText: 'std::cin >> ${1};',
  },
  {
    label: 'for',
    documentation: 'Classic for loop',
    insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t${3}\n}',
  },
  {
    label: 'forrange',
    documentation: 'Range-based for loop',
    insertText: 'for (const auto& ${1:item} : ${2:container}) {\n\t${3}\n}',
  },
  {
    label: 'while',
    documentation: 'while loop',
    insertText: 'while (${1:condition}) {\n\t${2}\n}',
  },
  {
    label: 'if',
    documentation: 'if statement',
    insertText: 'if (${1:condition}) {\n\t${2}\n}',
  },
  {
    label: 'ifelse',
    documentation: 'if/else statement',
    insertText: 'if (${1:condition}) {\n\t${2}\n} else {\n\t${3}\n}',
  },
  {
    label: 'class',
    documentation: 'Class definition',
    insertText: 'class ${1:Name} {\npublic:\n\t${2:Name}();\n\t~${2:Name}();\n\nprivate:\n\t${3}\n};',
  },
  {
    label: 'struct',
    documentation: 'Struct definition',
    insertText: 'struct ${1:Name} {\n\t${2}\n};',
  },
  {
    label: 'try',
    documentation: 'try/catch block',
    insertText: 'try {\n\t${1}\n} catch (const std::exception& e) {\n\t${2:// handle error}\n}',
  },
  {
    label: 'namespace',
    documentation: 'namespace block',
    insertText: 'namespace ${1:name} {\n\t${2}\n}',
  },
  {
    label: 'using',
    documentation: 'using namespace std',
    insertText: 'using namespace std;',
  },
  {
    label: 'auto',
    documentation: 'auto type deduction',
    insertText: 'auto ${1:name} = ${2:value};',
  },
  {
    label: 'template',
    documentation: 'Template declaration',
    insertText: 'template <typename ${1:T}>\n${2}',
  },
];

// ─── TypeScript extras (supplements Monaco's built-in TS worker) ──────────────

const TYPESCRIPT_SNIPPETS = [
  {
    label: 'interface',
    documentation: 'TypeScript interface',
    insertText: 'interface ${1:Name} {\n\t${2}\n}',
  },
  {
    label: 'type',
    documentation: 'Type alias',
    insertText: 'type ${1:Name} = ${2};',
  },
  {
    label: 'enum',
    documentation: 'TypeScript enum',
    insertText: 'enum ${1:Name} {\n\t${2}\n}',
  },
  {
    label: 'generic',
    documentation: 'Generic function',
    insertText: 'function ${1:name}<${2:T}>(${3:arg}: ${2:T}): ${4:${2:T}} {\n\t${5}\n}',
  },
  {
    label: 'trycatch',
    documentation: 'try/catch with unknown error',
    insertText: 'try {\n\t${1}\n} catch (err: unknown) {\n\t${2}\n}',
  },
];

const TYPESCRIPT_EXTRA_KEYWORDS = [
  'interface', 'type', 'enum', 'namespace', 'declare', 'abstract',
  'readonly', 'keyof', 'typeof', 'infer', 'never', 'unknown', 'any',
  'void', 'string', 'number', 'boolean', 'object', 'symbol', 'bigint',
  'undefined', 'null',
  'Array', 'Promise', 'Record', 'Partial', 'Required', 'Readonly',
  'Pick', 'Omit', 'Exclude', 'Extract', 'NonNullable', 'ReturnType',
  'Parameters', 'ConstructorParameters', 'InstanceType', 'Awaited',
];

// ─── Registration helper ──────────────────────────────────────────────────────

interface SnippetDef {
  label: string;
  documentation: string;
  insertText: string;
}

function registerLanguage(
  monaco: Monaco,
  language: string,
  keywords: string[],
  builtins: string[],
  snippets: SnippetDef[],
) {
  if (registeredLanguages.has(language)) return;
  registeredLanguages.add(language);

  monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems(model: monacoEditor.editor.ITextModel, position: monacoEditor.Position) {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const suggestions = [
        ...keywords.map(kw => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),
        ...builtins.map(b => ({
          label: b,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: b,
          range,
        })),
        ...snippets.map(s => ({
          label: s.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: s.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: s.documentation,
          range,
        })),
      ];

      return { suggestions };
    },
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function registerCompletionProviders(monaco: Monaco): void {
  registerLanguage(monaco, 'python', PYTHON_KEYWORDS, PYTHON_BUILTINS, PYTHON_SNIPPETS);
  registerLanguage(monaco, 'java', JAVA_KEYWORDS, [], JAVA_SNIPPETS);
  registerLanguage(monaco, 'cpp', CPP_KEYWORDS, [], CPP_SNIPPETS);
  registerLanguage(monaco, 'typescript', TYPESCRIPT_EXTRA_KEYWORDS, [], TYPESCRIPT_SNIPPETS);
}
