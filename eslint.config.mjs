import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default [
    // Ignore patterns
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "public/**",
            "*.config.js",
            "*.config.mjs",
            "*.config.ts",
        ],
    },
    // Base JS config
    js.configs.recommended,
    // TypeScript files
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                React: "readonly",
                JSX: "readonly",
                // Browser notification types
                NotificationPermission: "readonly",
                NotificationOptions: "readonly",
                // Node.js types
                NodeJS: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
            "react": reactPlugin,
            "react-hooks": reactHooksPlugin,
            "@next/next": nextPlugin,
        },
        rules: {
            // TypeScript rules
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
            "@typescript-eslint/no-explicit-any": "warn",
            "no-unused-vars": "off", // Use TS version instead

            // React rules
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // Next.js rules
            "@next/next/no-html-link-for-pages": "warn",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];
