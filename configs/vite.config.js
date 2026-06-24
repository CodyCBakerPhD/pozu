import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
    root: "src",
    base: "./",
    publicDir: false,
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // `root` is `src/`, but rollup needs absolute paths here.
                index: resolve(__dirname, "../src/index.html"),
                box: resolve(__dirname, "../src/box.html"),
            },
        },
    },
});
