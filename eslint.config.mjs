import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import * as tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prettier configuration
const prettierConfig = {
    files: [
        '**/*.ts',
        '**/*.tsx',
        '**/*.js',
        '**/*.jsx',
        '**/*.cjs',
        '**/*.mjs',
    ],
    plugins: {
        prettier: eslintPluginPrettier,
    },
    rules: {
        ...prettier.rules,
        'prettier/prettier': [
            'error',
            {
                singleQuote: true,
                tabWidth: 4,
                printWidth: 80,
                trailingComma: 'es5',
                endOfLine: 'lf',
            },
        ],
    },
};

// Common TypeScript configuration
const commonTypeScriptConfig = {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
        '@typescript-eslint': tseslint.plugin,
        import: eslintPluginImport,
    },
    languageOptions: {
        parser: tseslint.parser,
        parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            project: true,
        },
    },
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                ignoreRestSiblings: true,
                destructuredArrayIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
        'no-unused-vars': 'off', // Turn off the base rule as it can report incorrect errors
        '@typescript-eslint/parameter-properties': [
            'error',
            { prefer: 'parameter-property' },
        ], // Enforce parameter properties
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-undef': 'off', // Turn off base rule as TypeScript handles this better
        '@typescript-eslint/no-namespace': 'off', // Allow the use of namespaces
        '@typescript-eslint/sort-type-constituents': 'error',
        '@typescript-eslint/member-ordering': 'error',
        'sort-imports': [
            'error',
            {
                ignoreCase: false,
                ignoreDeclarationSort: true, // We'll handle declaration sorting separately
                ignoreMemberSort: false,
                memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
                allowSeparatedGroups: true,
            },
        ],
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                disallowTypeAnnotations: true,
            },
        ],
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'parent',
                    'sibling',
                    'index',
                    'object',
                    'type',
                ],
                pathGroups: [
                    {
                        pattern: '@/**',
                        group: 'external',
                        position: 'after',
                    },
                ],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
            },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'explicit',
                overrides: {
                    constructors: 'no-public',
                },
            },
        ],
    },
};

// Backend specific configuration
const backendConfig = {
    ...commonTypeScriptConfig,
    name: 'photos-of-no-w-here/backend',
    files: ['packages/backend/**/*.ts', 'packages/backend/**/*.js'],
    ignores: [
        'packages/backend/dist/**/*',
        'packages/backend/node_modules/**/*',
        'packages/backend/coverage/**/*',
    ],
    plugins: {
        ...commonTypeScriptConfig.plugins,
    },
    languageOptions: {
        ...commonTypeScriptConfig.languageOptions,
        parserOptions: {
            ...commonTypeScriptConfig.languageOptions.parserOptions,
            project: './packages/backend/tsconfig.json',
            tsconfigRootDir: __dirname,
        },
        globals: {
            ...globals.node,
            ...globals.jest,
        },
    },
    settings: {},
    rules: {
        ...commonTypeScriptConfig.rules,
        'class-methods-use-this': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
    },
};

// Frontend specific configuration
/** @type {import('eslint').Linter.Config} */
const frontendConfig = {
    ...commonTypeScriptConfig,
    name: 'photos-of-no-w-here/frontend',
    files: ['packages/frontend/**/*.ts', 'packages/frontend/**/*.tsx'],
    ignores: [
        'packages/frontend/dist/**/*',
        'packages/frontend/node_modules/**/*',
        'packages/frontend/vite.config.ts',
    ],
    languageOptions: {
        ...commonTypeScriptConfig.languageOptions,
        parserOptions: {
            ...commonTypeScriptConfig.languageOptions.parserOptions,
            project: './packages/frontend/tsconfig.app.json',
            tsconfigRootDir: __dirname,
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    plugins: {
        ...commonTypeScriptConfig.plugins,
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh,
    },
    rules: {
        ...commonTypeScriptConfig.rules,
        ...reactHooks.configs.recommended.rules,
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
    },
};

// Node.js CommonJS configuration
const nodeCommonJSConfig = {
    files: ['**/*.js', '**/*.cjs'],
    ignores: ['**/dist/**', '**/build/**'],
    languageOptions: {
        sourceType: 'commonjs',
        ecmaVersion: 'latest',
        globals: globals.node,
    },
    rules: {
        'no-console': 'off',
    },
};

export default [
    // Base JS config
    js.configs.recommended,

    // Prettier config (should come before other configs)
    prettierConfig,

    // Backend config
    backendConfig,

    // Frontend config
    frontendConfig,

    // CommonJS config
    nodeCommonJSConfig,

    // Global ignores
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/.git/**',
            'packages/frontend_old/**',
        ],
    },
];
