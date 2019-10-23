<template>
    <div class="wrapper">
        <div id="editor" ref="editor"></div>
        <div class="editor-controls">
            <ui-icon-button
                @click="onFormatRequest"
                type="secondary"
                class="editor-controls__icon"
                icon="sort_by_alpha"
            ></ui-icon-button>
            <ui-icon-button
                @click="onShowKeybindingsRequest"
                type="secondary"
                class="editor-controls__icon"
                icon="keyboard"
            ></ui-icon-button>
            <ui-icon-button
                @click="onShowReturnObjects"
                type="secondary"
                class="editor-controls__icon"
                icon="web_asset"
            ></ui-icon-button>
            <ui-modal ref="returnObjects" title="JSON objects">
                <h1>Schema</h1>
                <code class="schema-code-help">{{ actionSchema }}</code>
                <h1>Snippets</h1>
                <div
                    class="snippet-area-help"
                    v-for="(val, key) in actionSnippets"
                    :key="key"
                >
                    <section>
                        <strong>Action: {{ key }}</strong>
                    </section>
                    <code class="snippet-code-help">{{ val }}</code>
                </div>
            </ui-modal>
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

import Vue from 'vue'

import City from './City.vue'
// import ace from 'ace-builds/src-min-noconflict/ace'
import ace from 'ace-builds'
import { Range, EditSession } from 'ace-builds'
import snippetManager from 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-keybinding_menu'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/webpack-resolver'

import { UiIconButton, UiModal } from 'keen-ui'

import prettier from 'prettier/standalone'
import parserBabylon from 'prettier/parser-babylon'

import { registerSnippets, createSnippets } from './ace-snippets-extension'
// import DiffMatchPatch from 'diff-match-patch'

import jshintSettings from './ace.jshint.settings'

import build from './json-snippets/build.json'
import invest from './json-snippets/invest.json'
import move from './json-snippets/move.json'
import skip from './json-snippets/skip.json'

import actionSchema from './json-schemas/action.schema.json'

import startingUserCode from '!!raw-loader!./iframe-isolated/starting-user-code'

// import ace from 'ace-builds/src/mode-javascript'
// import '!file-loader!ace-builds/src/'

export default {
    components: { UiIconButton, UiModal },
    props: {
        defaultText: {
            type: String,
            default: () => startingUserCode,
        },
    },
    methods: {
        onShowReturnObjects() {
            this.$refs.returnObjects.open()
        },
        onShowKeybindingsRequest() {
            this.ace.editor.execCommand('showKeyboardShortcuts')
        },
        formatText(text) {
            return prettier.format(text, {
                parser: 'babel',
                plugins: [parserBabylon],
                // general formatting options
                trailingComma: 'none',
                tabWidth: 4,
                semi: false,
                singleQuote: true,
            })
        },
        onFormatRequest() {
            let text = this.ace.editor.session.getValue()

            let prettified = this.formatText(text)

            this.ace.editor.session.setValue(prettified)
        },
    },
    mounted() {
        this.ace.editor = ace.edit(this.$refs.editor)

        this.ace.editor.session.setValue(this.formatText(this.defaultText))

        this.ace.editor.commands.addCommand({
            name: 'showKeyboardShortcuts',
            bindKey: { win: 'Ctrl-Alt-h', mac: 'Command-Alt-h' },
            exec: function(editor) {
                ace.config.loadModule('ace/ext/keybinding_menu', function(
                    module
                ) {
                    module.init(editor)
                    editor.showKeyboardShortcuts()
                })
            },
        })

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
                    session.$worker.send('setOptions', jshintSettings)
                }
            }
        })

        this.ace.editor.session.setMode('ace/mode/javascript')

        // set up snippets
        Vue.set(this.actionSnippets, 'build', build)
        Vue.set(this.actionSnippets, 'move', move)
        Vue.set(this.actionSnippets, 'skip', skip)

        Object.keys(this.actionSnippets).forEach(actionName => {
            delete this.actionSnippets[actionName].$schema
        })

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
        actionSnippets: {},
        actionSchema: JSON.stringify(actionSchema, undefined, 4),
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

    border-right: 4px solid#454545;
    border-bottom: 4px solid#454545;
}

.editor-controls__icon {
    margin: 0 4px;
}

.editor-controls {
    font-size: 36px;
    display: flex;
    flex-direction: column;
    align-content: flex-end;
    margin: 4px 0;
}

.schema-code-help {
    white-space: pre-wrap;
}

.snippet-code-help {
    white-space: pre-wrap;
}

.snippet-area-help {
    margin-bottom: 8px;
}
</style>
