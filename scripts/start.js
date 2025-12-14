const { spawn } = require("node:child_process");

delete process.env.ELECTRON_RUN_AS_NODE;

const electronBinary = require("electron");
const appPath = process.cwd();
const extraArgs = process.argv.slice(2);

const child = spawn(electronBinary, [appPath, ...extraArgs], {
  stdio: "inherit",
  env: process.env
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
