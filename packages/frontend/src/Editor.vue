<template>
    <div class="wrapper">
        <div id="editor" ref="editor"></div>
        <div class="editor-controls">
            <ui-icon-button
                @click="onFormatRequest"
                type="secondary"
                class="editor-controls__icon"
                tooltip="Apply Prettier on code"
                icon="sort_by_alpha"
            ></ui-icon-button>
            <ui-icon-button
                @click="onShowKeybindingsRequest"
                type="secondary"
                class="editor-controls__icon"
                tooltip="Show keybindings for editor textbox (Ace)"
                icon="keyboard"
            ></ui-icon-button>
            <ui-icon-button
                @click="onShowReturnObjects"
                type="secondary"
                class="editor-controls__icon"
                tooltip="Show schema for returning valid action objects, plus misc. other useful information"
                icon="help"
            ></ui-icon-button>
            <ui-modal ref="returnObjects" title="JSON objects">
                <h1>General tips</h1>
                <p>
                    Please check the "gameState" object for a lot of useful
                    things (like coordinates), you can use either `console.log`
                    it or use a `debugger;` statement to access them in chrome
                    devtools, whichever you prefer!
                </p>
                <h1>The "action" schema</h1>
                <p>
                    This is the schema that validates your returned action in
                    the code, which is consumed by ajv, a json validation
                    library that follows the JSON spec. It is a little hard to
                    read, so do check the snippets as well.
                </p>
                <code class="schema-code-help">{{ actionSchema }}</code>
                <h1>Snippets</h1>
                <p>
                    Helpful snippets (also accessible via Ctrl + Space and
                    typing "action")
                </p>
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
            <ui-icon-button
                @click="onShowLocalStorageCode"
                type="secondary"
                class="editor-controls__icon"
                icon="storage"
                tooltip="Restore code that was lost during browser refresh and whatnot."
            ></ui-icon-button>
            <ui-icon-button
                @click="onSyncRoomCodes"
                type="secondary"
                color="primary"
                class="editor-controls__icon"
                icon="sync"
                tooltip="Take latest code from the other users in current room, apply to the game engine, and start over."
            ></ui-icon-button>
            <ui-icon-button
                has-dropdown
                type="secondary"
                color="primary"
                class="editor-controls__icon"
                icon="done"
                ref="commitButton"
                tooltip="Commit your own code and upload the code changes. Afterwards, you needs to start over manually."
            >
                <div class="my-custom-dropdown" slot="dropdown">
                    <ui-textbox
                        :autofocus="true"
                        :multiLine="false"
                        :maxlength="50"
                        :enforceMaxlength="true"
                        label="Optional commit message"
                        :disabled="commitAutomatically"
                        type="text"
                        v-model="commitMessage"
                    ></ui-textbox>
                    <div class="commit-dropdown-controls">
                        <ui-button
                            raised
                            class="editor-controls__icon"
                            icon="done"
                            type="primary"
                            color="primary"
                            :disabled="
                                !uncommittedCodeExists || commitAutomatically
                            "
                            :icon-position="'left'"
                            :size="'normal'"
                            @click="onCommit"
                            >Commit
                        </ui-button>
                        <ui-checkbox
                            style="padding: 8px 8px 0;"
                            v-model="commitAutomatically"
                            @input="onAutomaticCommitChange"
                            >Commit automatically</ui-checkbox
                        >
                    </div>
                </div></ui-icon-button
            >
            <ui-modal
                ref="localStorageCode"
                title="Code backed up in browser (localstorage)"
            >
                <h1>Code backups</h1>
                <p>
                    Here you can see the code saved in the browser's
                    localstorage, saved both automatically and on commit (along
                    with the commit message).
                </p>
                <p>Hopefully this will help to save you from losing things.</p>
                <div class="editor-controls__delete-backups-controls">
                    <ui-select
                        label="Pick a restore point"
                        class="editor-controls__delete-backups-select"
                        :options="localStorageCodes"
                        v-model="selectedLocalStorageItemToShow"
                    ></ui-select>
                    <ui-button
                        raised
                        class="editor-controls__icon"
                        icon="delete_forever"
                        type="primary"
                        color="primary"
                        :disabled="
                            !localStorageCodes || localStorageCodes.length === 0
                        "
                        :icon-position="'left'"
                        :size="'normal'"
                        @click="onDeleteBackups"
                        >Delete backups
                    </ui-button>
                </div>
                <code
                    v-if="
                        selectedLocalStorageItemToShow &&
                            selectedLocalStorageItemToShow.value
                    "
                    class="backup-code"
                    >{{ selectedLocalStorageItemToShow.value }}</code
                >
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

import {
    UiIconButton,
    UiModal,
    UiSelect,
    UiTextbox,
    UiButton,
    UiCheckbox,
} from 'keen-ui'

import moment from 'moment'

import prettier from 'prettier/standalone'
import parserBabylon from 'prettier/parser-babylon'

import { registerSnippets, createSnippets } from './ace-snippets-extension'
// import DiffMatchPatch from 'diff-match-patch'

import jshintSettings from './ace.jshint.settings'

import build from './json5-snippets/build.json'
import move from './json5-snippets/move.json'
import skip from './json5-snippets/skip.json'

import actionSchema from './json-schemas/action.schema.json'

import startingUserCode from '!!raw-loader!./iframe-isolated/starting-user-code'

// import ace from 'ace-builds/src/mode-javascript'
// import '!file-loader!ace-builds/src/'

moment.updateLocale('en', {
    longDateFormat: {
        LT: 'h:mm:ss A',
        // L: "MM/DD/YYYY",
        // l: "M/D/YYYY",
        // LL: "MMMM Do YYYY",
        // ll: "MMM D YYYY",
        // LLL: "MMMM Do YYYY LT",
        // lll: "MMM D YYYY LT",
        // LLLL: "dddd, MMMM Do YYYY LT",
        // llll: "ddd, MMM D YYYY LT"
    },
})

export default {
    components: {
        UiIconButton,
        UiModal,
        UiSelect,
        UiTextbox,
        UiButton,
        UiCheckbox,
    },
    methods: {
        onEditorTextChange() {
            this.codeHasErrors =
                this.ace.editor.session &&
                this.ace.editor.session
                    .getAnnotations()
                    // it's nice to ignore warnings in general
                    // but if we'd want to, we could ignore messages on row/col index -1
                    // because they are just general warnings, and sometimes errors
                    .filter(
                        a =>
                            // a.column === -1 &&
                            // a.row === -1 &&
                            a.type !== 'warning'
                    ).length > 0

            if (!this.codeHasErrors) {
                if (
                    this.lastCommittedCode === null ||
                    this.commitAutomatically
                ) {
                    this.onCommit()
                } else {
                    let code = this.ace.editor.session.getValue()

                    this.uncommittedCodeExists = this.lastCommittedCode !== code

                    this.backupCode(code)
                }
            }
        },
        onAutomaticCommitChange() {
            if (this.commitAutomatically && this.uncommittedCodeExists) {
                // hacky, trigger editor change and take it from there
                this.onEditorTextChange()
            }
        },
        onSyncRoomCodes() {
            this.$emit('sync-room-request')
        },
        onDeleteBackups() {
            window.localStorage.setItem('code', '[]')
            this.selectedLocalStorageItemToShow = ''
            this.localStorageCodes = JSON.parse(
                window.localStorage.getItem('code') || '[]'
            )
            this.loadedLocalStorageCode = ''

            this.$refs['localStorageCode'].close()
        },
        backupCode(code, customMessage = '') {
            if (this.startingUserCode === code) {
                // no need to backup the sample code
                return
            }

            let newValue = [
                {
                    label:
                        moment().calendar() +
                        (customMessage !== '' ? ': ' + customMessage : ''),
                    value: code,
                },
                ...this.localStorageCodes,
            ].slice(0, 100)
            this.localStorageCodes = newValue

            window.localStorage.setItem('code', JSON.stringify(newValue))
        },
        onCommit() {
            this.$refs['commitButton'].closeDropdown()

            const code = this.ace.editor.session.getValue()
            this.backupCode(code, this.commitMessage)

            this.commitMessage = ''

            this.$emit('code-change', {
                getText: () => code,
            })

            this.lastCommittedCode = code
            this.uncommittedCodeExists = this.lastCommittedCode !== code
            this.hasEmittedChange = true
        },
        onShowLocalStorageCode() {
            this.loadedLocalStorageCode =
                window.localStorage.getItem('code') ||
                'Oops, no code has been saved yet!'
            this.$refs.localStorageCode.open()
        },
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

        this.ace.editor.session.setValue(this.formatText(this.startingUserCode))

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
                    name: 'action: move',
                    code: 'return ' + JSON.stringify(move, undefined, 4),
                },
                {
                    name: 'action: skip',
                    code: 'return ' + JSON.stringify(skip, undefined, 4),
                },
            ])
        )

        this.ace.editor.session.on('change', text => {
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
            this.onEditorTextChange()
        })

        // this.ace.editor.session.on('changeAnnotation', function(a, b) {
        //     console.log('changeAnnotation')
        // })

        // because we want some initial emission of code change
        // if (!this.hasEmittedChange) {
        //     this.hasEmittedChange = true

        //     this.$emit('code-change', {
        //         getText: () => this.ace.editor.session.getValue(),
        //     })
        // }
    },
    data() {
        return {
            startingUserCode: this.formatText(startingUserCode),
            commitAutomatically: true,
            lastCommittedCode: null,
            uncommittedCodeExists: false,
            commitMessage: '',
            text: '',
            selectedLocalStorageItemToShow: '',
            localStorageCodes: JSON.parse(
                window.localStorage.getItem('code') || '[]'
            ),
            loadedLocalStorageCode: '',
            hasEmittedChange: false,
            ace: {
                editor: null,
            },
            actionSnippets: {},
            actionSchema: JSON.stringify(actionSchema, undefined, 4),
        }
    },
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

.editor-controls__delete-backups-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.editor-controls__delete-backups-select {
    flex: 1;
    padding-right: 8px;
}

.editor-controls {
    font-size: 36px;
    display: flex;
    flex-direction: column;
    align-content: flex-end;
    margin: 4px 0;
}

.commit-dropdown-controls {
    display: flex;
    flex-direction: row;
}

.schema-code-help {
    white-space: pre-wrap;
}

.backup-code {
    white-space: pre-wrap;
}

.snippet-code-help {
    white-space: pre-wrap;
}

.snippet-area-help {
    margin-bottom: 8px;
}

.my-custom-dropdown {
    padding: 8px;
    min-width: 300px;
}
</style>
