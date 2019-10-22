<template>
    <div class="wrapper">
        <div class="multiplayer-editor" ref="multiplayer-editor"></div>
    </div>
</template>
<script>
// import '!!file-loader!monaco-editor';
// import '!!file-loader!monaco-editor/esm/vs/editor/editor.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/json/json.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/css/css.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/html/html.worker.js';
// import  '!!file-loader!monaco-editor/esm/vs/language/typescript/ts.worker.js';

// import ace from 'ace-builds/src-min-noconflict/ace'
import ace from 'ace-builds'
import { Range, EditSession } from 'ace-builds'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/webpack-resolver'
// import ace from 'ace-builds/src/mode-javascript'
// import '!file-loader!ace-builds/src/'

import jshintSettings from './ace.jshint.settings'

export default {
    mounted() {
        this.editor = ace.edit(this.$refs['multiplayer-editor'])

        this.editor.setOptions({
            // enableBasicAutocompletion: true,
            // enableSnippets: true,
            // enableLiveAutocompletion: false,
            readOnly: true,
        })

        this.editor.setTheme('ace/theme/monokai')

        this.editor.session.on('changeMode', function(e, session) {
            if ('ace/mode/javascript' === session.getMode().$id) {
                if (!!session.$worker) {
                    session.$worker.send('setOptions', jshintSettings)
                }
            }
        })

        this.editor.session.setMode('ace/mode/javascript')

        window.edt = this.editor
    },
    methods: {},
    props: {
        code: {
            type: String,
            default: () => '',
        },
    },
    watch: {
        code(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.editor.session.setValue(newVal)
            }
        },
    },
    data: () => ({
        editor: null,
    }),
}
</script>
<style scoped>
.wrapper {
    flex: 1;
    /* height: 100%; */
    width: 100%;

    height: 400px;
}

.multiplayer-editor {
    height: 100%;
    width: 100%;

    border-left: 3px solid#454545;
    border-bottom: 4px solid#454545;
}
</style>
