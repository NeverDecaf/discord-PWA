import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/betterdiscord/webpack/index.ts"],
    bundle: true,
    format: "esm",
    outfile: "dist/webpackmodules.js",
    platform: "browser",
    target: "es2020",
    sourcemap: true,
    logLevel: "info",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.__BRANCH__": '"main"',
      "process.env.__COMMIT__": '"unknown"',
      "process.env.__BUILD__": '"dev"',
      "process.env.__VERSION__": '"1.0.0"',
      "process.env.DISCORD_APP_PATH": '"/dev/null"',
      "process.env.DISCORD_USER_DATA": '"/dev/null"',
      "process.env.BETTERDISCORD_DATA_PATH": '"/dev/null"',
    },
    plugins: [
      {
        name: "path-stub",
        setup(build) {
          build.onResolve({ filter: /^path$/ }, (args) => ({
            path: args.path, // ✅ FIXED: Return the actual path string
            namespace: "path-stub",
          }));
          build.onLoad({ filter: /.*/, namespace: "path-stub" }, () => ({
            contents: `export default { join: (a,b) => a+"/"+b, resolve: (a,b) => a+"/"+b }`,
            loader: "js",
          }));
        },
      },
      {
        name: "remote-stub",
        setup(build) {
          build.onLoad({ filter: /remote\.ts$/ }, () => ({
            contents: `
        var RemoteAPI = null;
        var remote_default = null;
        export { RemoteAPI as default, remote_default };
      `,
            loader: "js",
          }));
        },
      },
    ],
  })
  .then(() => console.log("✅ Build complete"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
