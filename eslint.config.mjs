import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // --- Add these below ---
    "node_modules/**",     // Essential to prevent linting external libraries
    "public/**",           // Static assets like images/fonts don't need linting
    "dist/**",             // Compiled code
    ".cache/**",           // Development cache files
    ".vscode/**",          // Editor settings
    "*.config.js",         // Configuration files (tailwind, next, etc.)
    "*.config.ts",
    "coverage/**",         // Testing reports
  ]),
]);

export default eslintConfig;