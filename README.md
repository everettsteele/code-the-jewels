# Code The Jewels

A stylized programming language inspired by Run The Jewels. `.rtj` files compile to JavaScript.

## Installation

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
node dist/cli.js run hello.rtj
```

Output: `code the jewels`

## Keywords

| Keyword    | Purpose                        | JS Equivalent          |
|------------|--------------------------------|------------------------|
| `jewel`    | Declare a variable             | `const`                |
| `verse`    | Declare a function             | `function`             |
| `send`     | Return a value                 | `return`               |
| `talk`     | Print to console               | `console.log`          |
| `ifwild`   | Conditional                    | `if`                   |
| `elsewild` | Else branch                    | `else`                 |
| `run`      | Loop over a collection         | `for...of`             |
| `in`       | Iterator keyword               | `of`                   |
| `feature`  | Import from standard library   | destructured `require` |
| `from`     | Import source                  | module path            |
| `yank`     | Throw an error                 | `throw`                |
| `duo`      | Dual pipeline block            | (custom)               |
| `mike`     | First pipeline in a duo block  | (custom)               |
| `el`       | Second pipeline in a duo block | (custom)               |

## Pipe Operator

The pipe operator `|>` chains function calls left to right.

```
feature trim, upper from "bk:text"

jewel line = "  code the jewels  "
jewel clean = line |> trim |> upper

talk clean
// Output: CODE THE JEWELS
```

## Duo Blocks

`duo` runs an input through two named pipelines: `mike` (first pass) and `el` (second pass). The mike pipeline processes the input, then the el pipeline processes the result.

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

## Standard Library

### bk:text
String operations: `trim`, `upper`, `lower`, `split`, `join`

### bk:parse
Text parsing: `words`, `lines`, `chars`

### atl:data
Data operations: `count`, `countBy`, `first`, `last`

### atl:flow
Control flow: `identity`

## CLI Commands

```bash
# Run a .rtj file
node dist/cli.js run <file.rtj>

# Compile to JavaScript
node dist/cli.js compile <file.rtj>

# Check for errors (parse + semantic only)
node dist/cli.js check <file.rtj>

# Start interactive REPL
node dist/cli.js repl
```

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

MIT
