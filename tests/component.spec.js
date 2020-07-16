const assert = require("assert");
const path = require("path");
const { exec } = require("child_process");

const bin = path.resolve(__dirname, "../dist/cli.js");
const fixtureDir = path.resolve(__dirname, "./fixture");

const spec = (err, stdout) => {
  assert.equal(Boolean(err), true);
  assert.ok(
    stdout.includes(`/ComponentOne.vue
2:40 Property 'property' does not exist on type '{ value: number; }'.
  0 | <template>
  1 |   <div id="app">
> 2 |     <p v-for="item in items" :key="item.property">{{ item.value }}</p>
    |                                         ^^^^^^^^
  3 |   </div>
  4 | </template>
`)
  );

  assert.ok(
    stdout.includes(`
17:27 Property 'value' does not exist on type '{ value: number; }[]'. Did you mean 'values'?
  15 |   },
  16 |   methods() {
> 17 |     console.log(this.items.value);
     |                            ^^^^^
  18 |   }
  19 | });
`)
  );
}

exec(`node ${bin} --workspace ${fixtureDir}`, spec);
exec(`node ${bin} --workspace ${fixtureDir} --onlyTypeScript`, spec);
exec(`node ${bin} --workspace ${fixtureDir} --excludeDir ./`, (err, stdout) => {
  assert.equal(Boolean(err), false);
});
exec(`node ${bin} --workspace ${fixtureDir} --excludeDir ./ --excludeDir ./tests`, (err, stdout) => {
  assert.equal(Boolean(err), false);
});
