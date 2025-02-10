const { configs } = require("@eslint/js");
const jest = require("eslint-plugin-jest");
const globals = require("globals");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");

module.exports = [
    configs.recommended,
    {
        ignores: ["dist/", "conf/", "coverage/"],
        files: ["src/**/*.ts"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: tsParser,
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            semi: "error",
            quotes: ["error", "double"],
            indent: ["error", 4, { SwitchCase: 1 }],
            "@typescript-eslint/no-unused-vars": "off",
            "no-console": "off",
        },
    },
    {
        files: ["test/**/*.test.ts"],
        languageOptions: {
            globals: { ...globals.jest },
        },
        ...jest.configs["flat/recommended"],
        rules: {
            ...jest.configs["flat/recommended"].rules,
        },
    },
];
