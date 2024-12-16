# Polygen

Polygen is a library for React Native that allows you to run WebAssembly modules in your apps, statically, without interpreting.

## Getting started

> [!WARNING]
> This library is still under active development. Feel free to hack around, but use at your own risk.

## How it works?

Instead of interpreting the WebAssembly modules, or doing Just-in-Time compilation, Polygen instead leverages the Ahead-of-Time compilation.
This solution can be used in iOS applications and other Apple devices, where JIT compilation is not allowed,
without impacting performance.

It uses the wonderful [`wasm2c`](https://github.com/WebAssembly/wabt/tree/main/wasm2c) tool to generate C code from every `WebAssembly` module.
Then, additional React Native/JSI glue native code is generated that allows to call the generated C code from JavaScript.

This gives us the ability to run WebAssembly modules in a statically compiled way, without the need for JIT compilation.

## Features

| Feature              | Status   |
|----------------------|----------|
| WebAssembly 2.0      | 🟩       |
| - Exceptions         | 🟥       |
| - Threads            | 🟥       |
| - Garbage Collection | 🟥       |
| - Multiple Memories  | 🟨       |
| - Mutable Globals    | 🟨       |
| WebAPI               | 🟨       |
| - Fetch              | 🟩       |
| Native               | 🟨       |
| - Metro              | 🟨       |
| - Re.Pack            | 🟥       |


## Requirements

- React Native 0.75+

## Prerequisites

Because Polygen Codegen depends on `wasm2c` tool, you need to have it installed on your machine.
You can install it by running:

```sh
$ git clone --recursive https://github.com/WebAssembly/wabt
$ cd wabt
$ git submodule update --init
$ cmake -B build -S .
$ cmake --build build
```

Then set the `WABT_PATH` environment variable `wabt/build`:

```sh
$ export WABT_PATH=$(pwd)/build
```

## Installation

```sh
npm i -g @callstack/polygen
```

## Usage

In your application folder run:

```sh
polygen init
polygen update
```

Run `polygen update` after any of the webassembly module changed.

## Examples

See `apps` directory for usage examples.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.


## Made with ❤️ at Callstack

Polygen is an open source project and will always remain free to use. If you think it's cool, please star it 🌟. [Callstack](https://callstack.com) is a group of React and React Native geeks, contact us at [hello@callstack.com](mailto:hello@callstack.com) if you need any help with these or just want to say hi!

Like the project? ⚛️ [Join the team](https://callstack.com/careers/?utm_campaign=Senior_RN&utm_source=github&utm_medium=readme) who does amazing stuff for clients and drives React Native Open Source! 🔥
