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

import City from './City.vue'
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

import jshintSettings from './ace.jshint.settings'

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
            default: () => `function main(gameState, playerState, lastAction) {
    // Hi there! Want to get started?
    // Focus this editor, press \`Ctrl + Space\` and type "action" to get suggestions.
    
    return {
        "action": "build"
    }
    
    // When you're done, try the play controls under the game view
}`,
        },
    },
    methods: {
        onFormatRequest() {
            let text = this.ace.editor.session.getValue()

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
                    session.$worker.send('setOptions', jshintSettings)
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

    border-right: 4px solid#454545;
    border-bottom: 4px solid#454545;
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
