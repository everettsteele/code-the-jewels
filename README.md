# Code The Jewels

> :point_right:{:gem:}.rtj

A programming language built the way Run The Jewels makes music. Two cities. Two voices. One compiler.

## Installation

```bash
npm install -g code-the-jewels
```

Or from source:

```bash
git clone https://github.com/everettsteele/code-the-jewels.git
cd code-the-jewels
npm install
npm run build
```

## Quick Start

Create `hello.rtj`:

```
talk "code the jewels"
```

Run it:

```bash
rtj run hello.rtj
```

Output: `code the jewels`

A duo block:

```
feature words from "bk:parse"
feature count from "atl:data"

jewel line = "walking in the snow"

jewel wordCount = duo(line) {
  mike: words
  el:   count
}

talk wordCount
```

Output: `4`

## Keywords

Every keyword traces back to RTJ.

| Keyword    | Purpose                        | JS Equivalent          | Origin                                      |
|------------|--------------------------------|------------------------|---------------------------------------------|
| `jewel`    | Declare a variable             | `const`                | The jewel. The core unit.                   |
| `verse`    | Declare a function             | `function`             | A verse. A block of bars.                   |
| `send`     | Return a value                 | `return`               | Send it back.                               |
| `talk`     | Print to console               | `console.log`          | "Talk to Me", RTJ3                          |
| `ifwild`   | Conditional                    | `if`                   | "if wild" check before you move             |
| `elsewild` | Else branch                    | `else`                 | The other path                              |
| `run`      | Loop over a collection         | `for...of`             | Run it.                                     |
| `in`       | Iterator keyword               | `of`                   | Run x in y                                  |
| `feature`  | Import from standard library   | destructured `require` | A feature. A guest appearance.              |
| `from`     | Import source                  | module path            | Where the feature comes from                |
| `yank`     | Throw an error                 | `throw`                | Yank the chain. Pull the plug.              |
| `duo`      | Dual pipeline block            | (custom)               | "yankee and the brave (ep. 4)", RTJ4        |
| `mike`     | First pipeline in a duo block  | (custom)               | Killer Mike. Atlanta.                       |
| `el`       | Second pipeline in a duo block | (custom)               | El-P. Brooklyn.                             |

## Pipe Operator

The pipe operator `|>` passes the jewel from one function to the next. Left to right. No nesting.

```
feature trim, upper from "bk:text"

jewel line = "  code the jewels  "
jewel clean = line |> trim |> upper

talk clean
// Output: CODE THE JEWELS
```

`a |> f |> g` compiles to `g(f(a))`. Each step takes the previous result as its argument.

## duo()

Named after "yankee and the brave (ep. 4)" from RTJ4. A duo block splits processing into two named pipelines.

`mike` runs first (Atlanta). `el` responds (Brooklyn). Both branches are required. A duo without both is just a solo.

```
feature trim from "bk:text"
feature words from "bk:parse"
feature count from "atl:data"

jewel bars = "  rtj from atlanta to brooklyn  "

jewel total = duo(bars) {
  mike: trim |> words
  el: count
}

talk total
// Output: 5
```

Compiles to: `el(mike(input))`. The mike pipeline feeds into the el pipeline. Two passes, one result.

## Standard Library

The standard library is split by city. `bk:` is Brooklyn (El-P's borough). `atl:` is Atlanta (Killer Mike's city).

### bk:text
String operations: `trim`, `upper`, `lower`, `split`, `join`

### bk:parse
Text parsing: `words`, `lines`, `chars`

### atl:data
Data operations: `count`, `countBy`, `first`, `last`

### atl:flow
Control flow: `identity`

## Compiler Stages

The compiler runs in stages. Each one has a name.

1. **The Fist (El)** / Lexer. Breaks source into tokens.
2. **The Hands** / Parser. Shapes tokens into an AST.
3. **Mike Pass** / Semantic analysis. Walks the tree, checks scope, validates imports.
4. **El Pass** / Optimization. (Reserved for v0.2.)
5. **The Gun (Mike)** / Code generator. Fires the AST into JavaScript.
6. **Jewel Box** / Output. The final `.js` file, ready to run.

## CLI Commands

```bash
# Run a .rtj file
rtj run <file.rtj>

# Compile to JavaScript
rtj compile <file.rtj>

# Check for errors (parse + semantic only)
rtj check <file.rtj>

# Start interactive REPL
rtj repl
```

## Version Naming

Each major version is named after an RTJ album.

| Version | Codename                    | Album |
|---------|-----------------------------|-------|
| v0.1    | RTJ0 "The Self-Titled Era"  | Run The Jewels (2013) |
| v0.2    | RTJ2 "The Meow Era"         | Run The Jewels 2 (2014) |
| v0.3    | RTJ3 "Talk to Me"           | Run The Jewels 3 (2016) |
| v0.4    | RTJ4 "The Brave Era"        | RTJ4 (2020) |

## Examples

See the `examples/` directory:
- `hello.rtj` - Hello world
- `pipes.rtj` - Pipe operator
- `duo.rtj` - Duo blocks
- `cities.rtj` - Functions and arrays
- `count-words.rtj` - Word frequency counting

## Links

[codethejewels.com](http://codethejewels.com)

## License

MIT. Free, like every RTJ album. Part of [Meridian](https://meridianbasehq.com).
