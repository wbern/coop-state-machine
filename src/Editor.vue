<template>
    <div class="wrapper">
        <div id="editor" ref="editor">{{ defaultText }}</div>
        <div class="editor-controls">
            <ui-icon-button
                @click="onFormatRequest"
                type="secondary"
                class="editor-controls__icon"
                icon="sort_by_alpha"
            ></ui-icon-button>
        </div>
    </div>
</template>
<script>
// import '!!file-loader!monaco-editor';
// import '!!file-loader!monaco-editor/esm/vs/editor/editor.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/json/json.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/css/css.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/html/html.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/typescript/ts.worker.js';

import City from './City'
// import ace from 'ace-builds/src-min-noconflict/ace'
import ace from 'ace-builds'
import { Range, EditSession } from 'ace-builds'
import snippetManager from 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/webpack-resolver'

import { UiIconButton } from 'keen-ui'

import prettier from 'prettier/standalone'
import parserBabylon from 'prettier/parser-babylon'

import { registerSnippets, createSnippets } from './ace-snippets-extension'
// import DiffMatchPatch from 'diff-match-patch'

import build from './json-snippets/build.json'
import invest from './json-snippets/invest.json'
import move from './json-snippets/move.json'
import skip from './json-snippets/skip.json'

// import ace from 'ace-builds/src/mode-javascript'
// import '!file-loader!ace-builds/src/'

export default {
    components: { UiIconButton },
    props: {
        defaultText: {
            type: String,
            default: () => `function main(gameState) {
    // Hi there! Want to get started?
    // Focus this editor, press \`Ctrl + Space\` and type "action" to get suggestions.
    
    
    
    // When you're done, try the play controls under the game view
}`,
        },
    },
    methods: {
        onFormatRequest() {
            let text = this.ace.editor.session.getValue()

            debugger
            let prettified = prettier.format(text, {
                parser: 'babylon',
                plugins: [parserBabylon],
            })

            this.ace.editor.session.setValue(prettified)
        },
    },
    mounted() {
        this.ace.editor = ace.edit(this.$refs.editor)

        // Use this later for networking
        // You can also use the following properties:
        // DiffMatchPatch.DIFF_DELETE = 'remove'
        // DiffMatchPatch.DIFF_INSERT = 'insert'
        // DiffMatchPatch.DIFF_EQUAL = undefined;

        // const dmp = new DiffMatchPatch()

        // const diff = dmp.diff_main('dogs bark', 'cats bark')

        this.ace.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false,
        })

        this.ace.editor.setTheme('ace/theme/monokai')

        this.ace.editor.session.on('changeMode', function(e, session) {
            if ('ace/mode/javascript' === session.getMode().$id) {
                if (!!session.$worker) {
                    session.$worker.send('setOptions', [
                        {
                            // Disables "Missing name in function declaration.",
                            '-W025': false,

                            // JSHint Default Configuration File (as on JSHint website)
                            // See http://jshint.com/docs/ for more details

                            maxerr: 50, // {int} Maximum error before stopping

                            // Enforcing
                            bitwise: true, // true: Prohibit bitwise operators (&, |, ^, etc.)
                            camelcase: false, // true: Identifiers must be in camelCase
                            curly: true, // true: Require {} for every new block or scope
                            eqeqeq: true, // true: Require triple equals (===) for comparison
                            forin: true, // true: Require filtering for..in loops with obj.hasOwnProperty()
                            freeze: true, // true: prohibits overwriting prototypes of native objects such as Array, Date etc.
                            immed: false, // true: Require immediate invocations to be wrapped in parens e.g. `(function () { } ());`
                            latedef: false, // true: Require variables/functions to be defined before being used
                            newcap: false, // true: Require capitalization of all constructor functions e.g. `new F()`
                            noarg: true, // true: Prohibit use of `arguments.caller` and `arguments.callee`
                            noempty: true, // true: Prohibit use of empty blocks
                            nonbsp: true, // true: Prohibit "non-breaking whitespace" characters.
                            nonew: false, // true: Prohibit use of constructors for side-effects (without assignment)
                            plusplus: false, // true: Prohibit use of `++` and `--`
                            quotmark: false, // Quotation mark consistency:
                            //   false    : do nothing (default)
                            //   true     : ensure whatever is used is consistent
                            //   "single" : require single quotes
                            //   "double" : require double quotes
                            undef: true, // true: Require all non-global variables to be declared (prevents global leaks)
                            unused: false, // Unused variables:
                            //   true     : all variables, last function parameter
                            //   "vars"   : all variables only
                            //   "strict" : all variables, all function parameters
                            strict: true, // true: Requires all functions run in ES5 Strict Mode
                            maxparams: false, // {int} Max number of formal params allowed per function
                            maxdepth: false, // {int} Max depth of nested blocks (within functions)
                            maxstatements: false, // {int} Max number statements per function
                            maxcomplexity: false, // {int} Max cyclomatic complexity per function
                            maxlen: false, // {int} Max number of characters per line
                            varstmt: false, // true: Disallow any var statements. Only `let` and `const` are allowed.

                            // Relaxing
                            asi: true, // true: Tolerate Automatic Semicolon Insertion (no semicolons)
                            boss: false, // true: Tolerate assignments where comparisons would be expected
                            debug: false, // true: Allow debugger statements e.g. browser breakpoints.
                            eqnull: false, // true: Tolerate use of `== null`
                            esversion: 5, // {int} Specify the ECMAScript version to which the code must adhere.
                            moz: false, // true: Allow Mozilla specific syntax (extends and overrides esnext features)
                            // (ex: `for each`, multiple try/catch, function expression…)
                            evil: false, // true: Tolerate use of `eval` and `new Function()`
                            expr: false, // true: Tolerate `ExpressionStatement` as Programs
                            funcscope: false, // true: Tolerate defining variables inside control statements
                            globalstrict: false, // true: Allow global "use strict" (also enables 'strict')
                            iterator: false, // true: Tolerate using the `__iterator__` property
                            lastsemic: false, // true: Tolerate omitting a semicolon for the last statement of a 1-line block
                            laxbreak: false, // true: Tolerate possibly unsafe line breakings
                            laxcomma: false, // true: Tolerate comma-first style coding
                            loopfunc: false, // true: Tolerate functions being defined in loops
                            multistr: false, // true: Tolerate multi-line strings
                            noyield: false, // true: Tolerate generator functions with no yield statement in them.
                            notypeof: false, // true: Tolerate invalid typeof operator values
                            proto: false, // true: Tolerate using the `__proto__` property
                            scripturl: false, // true: Tolerate script-targeted URLs
                            shadow: false, // true: Allows re-define variables later in code e.g. `var x=1; x=2;`
                            sub: false, // true: Tolerate using `[]` notation when it can still be expressed in dot notation
                            supernew: false, // true: Tolerate `new function () { ... };` and `new Object;`
                            validthis: false, // true: Tolerate using this in a non-constructor function

                            // Environments
                            browser: false, // Web Browser (window, document, etc)
                            browserify: false, // Browserify (node.js code in the browser)
                            couch: false, // CouchDB
                            devel: true, // Development/debugging (alert, confirm, etc)
                            dojo: false, // Dojo Toolkit
                            jasmine: false, // Jasmine
                            jquery: false, // jQuery
                            mocha: true, // Mocha
                            mootools: false, // MooTools
                            node: false, // Node.js
                            nonstandard: false, // Widely adopted globals (escape, unescape, etc)
                            phantom: false, // PhantomJS
                            prototypejs: false, // Prototype and Scriptaculous
                            qunit: false, // QUnit
                            rhino: false, // Rhino
                            shelljs: false, // ShellJS
                            typed: false, // Globals for typed array constructions
                            worker: true, // Web Workers
                            wsh: false, // Windows Scripting Host
                            yui: false, // Yahoo User Interface

                            // Custom Globals
                            globals: {
                                // something: true,
                            }, // additional predefined global variables
                        },
                    ])
                }
            }
        })

        this.ace.editor.session.setMode('ace/mode/javascript')

        // set up snippets
        delete build.$schema
        delete invest.$schema
        delete move.$schema
        delete skip.$schema

        registerSnippets(
            this.ace.editor,
            this.ace.editor.session,
            'javascript',
            createSnippets([
                {
                    name: 'action: build',
                    code: 'return ' + JSON.stringify(build, undefined, 4),
                },
                {
                    name: 'action: invest',
                    code: 'return ' + JSON.stringify(invest, undefined, 4),
                },
                {
                    name: 'action: move',
                    code: 'return ' + JSON.stringify(move, undefined, 4),
                },
                {
                    name: 'action: skip',
                    code: 'return ' + JSON.stringify(skip, undefined, 4),
                },
            ])
        )

        this.ace.editor.session.on('change', function(text) {
            this.text = text

            // e.session.insert(t.start, t.lines.join('\n'))
            // e.session.remove(
            //     new Range(
            //         text.start.row,
            //         text.start.column,
            //         text.end.row,
            //         text.end.column
            //     )
            // )
        })

        this.ace.editor.session.on('tokenizerUpdate', (a, e) => {
            // code has been parsed and annotations (warnings/errors) have been introduced
            if (
                this.ace.editor.session &&
                this.ace.editor.session
                    .getAnnotations()
                    // Filter away annoying non-line specific warnings like "ES5 option is now set per default"
                    .filter(
                        a =>
                            a.column !== -1 &&
                            a.row !== -1 &&
                            a.type !== 'warning'
                    ).length === 0
            ) {
                this.$emit('code-change', {
                    getText: () => this.ace.editor.session.getValue(),
                })
            }
        })

        // this.ace.editor.session.on('changeAnnotation', function(a, b) {
        //     console.log('changeAnnotation')
        // })
    },
    data: () => ({
        text: '',
        ace: {
            editor: null,
        },
    }),
}
</script>
<style scoped>
.wrapper {
    flex: 1;
    display: flex;
    height: 100%;
    width: 100%;
}

#editor {
    height: 100%;
    width: 100%;
}

.editor-controls__icon {
    margin: 0 4px;
}

.editor-controls {
    font-size: 36px;
    display: flex;
    justify-content: flex-end;
    margin: 4px 0;
}
</style>