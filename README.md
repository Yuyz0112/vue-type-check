<p align="center">
  <img width="100px" height="100px" src="https://raw.githubusercontent.com/Yuyz0112/vue-type-check/master/assets/logo.png">
</p>

# vue-type-check

vue-type-check is a type checker for typescript written Vue components.

It provides both a CLI wrapper and a programmatically API which is easy to integrate with your current workflow.

## Features

- type checking template code.
- type checking script code.

## Usage

### CLI

```shell
Install: npm i -g vue-type-check

Usage: vue-type-check or vtc
Options:
  --workspace        path to your workspace, required
  --srcDir           path to the folder which contains your Vue components, will fallback to the workspace when not passed
  --onlyTemplate     whether to check the script code in a single file component
```

#### Example

We are going to check a simple Vue component with two type errors:

```vue
<template>
  <div id="app">
    <p>{{ msg }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "app",
  data() {
    return {
      message: "Hello World!"
    };
  },
  methods: {
    printMessage() {
      console.log(this.message.toFixed(1));
    }
  }
});
</script>
```

![example.gif](https://raw.githubusercontent.com/Yuyz0112/vue-type-check/master/assets/vtc.gif)

### Programmatical API

```js
const { check } = require("vue-type-check");

(async () => {
  await check({
    workspace: PATH_TO_WORKSPACE,
    srcDir: PATH_TO_SRC_DIR,
    excludeDir: PATH_TO_EXCLUDE_DIR,
    onlyTemplate: TRUE_OR_FALSE,
    onlyTypeScript: TRUE_OR_FALSE
  });
})();
```

## How it works

Currently, the implementation is heavily based on vetur's awesome [interpolation feature](https://vuejs.github.io/vetur/interpolation.html).

If you are interested in the design decisions and the attempts on other approaches, they can be found in [this post](http://www.myriptide.com/vue-type-check/).
