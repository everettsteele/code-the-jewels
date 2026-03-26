# Code The Jewels

A programming language inspired by Run The Jewels.

`.rtj` files. Transpiles to JavaScript. Runs on Node.js.

```
npm install -g code-the-jewels
```

## Usage

```bash
rtj run file.rtj      # execute a .rtj file
rtj compile file.rtj  # transpile to output.js
rtj check file.rtj    # type/scope check without running
rtj repl              # interactive REPL
```

## Example

```
jewel trackName = "Legend Has It"
jewel bpm = 118

verse describe(name, tempo) {
  send `${name} hits at ${tempo} BPM`
}

talk describe(trackName, bpm)
```

## Language

13 keywords. A pipe operator (`|>`). A two-branch composition construct called `duo()`.

Standard library modules are named after cities: `bk:text`, `bk:parse`, `atl:data`, `atl:flow`.

Full docs at [codethejewels.com](https://codethejewels.com).

## License

MIT. Part of [Meridian](https://neverstill.llc) Creative Shit.
