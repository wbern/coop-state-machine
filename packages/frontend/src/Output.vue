<template>
    <div class="wrapper">
        <div id="output" ref="output"></div>
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
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/webpack-resolver'
// import ace from 'ace-builds/src/mode-javascript'
// import '!file-loader!ace-builds/src/'

export default {
    mounted() {
        window.addEventListener('output', this.onOutputFromWindow)

        this.editor = ace.edit(this.$refs.output)

        this.editor.setOptions({
            readOnly: true,
            showGutter: false,
            // showLineNumbers: false,
            vScrollBarAlwaysVisible: true,
            wrapBehavioursEnabled: true,
            autoScrollEditorIntoView: true,
            wrap: true,
        })

        this.editor.setTheme('ace/theme/monokai')
        this.editor.session.setMode('ace/mode/text')

        this.editor.session.on('change', () => {
            this.editor.renderer.scrollToLine(Number.POSITIVE_INFINITY)
        })

        window.edt = this.editor
    },
    beforeDestroy() {
        window.removeEventListener('output', this.onOutputFromWindow)
    },
    methods: {
        writeLine(text) {
            this.editor.session.insert(
                {
                    row: this.editor.session.getLength(),
                    column: 0,
                },
                text + '\n'
            )
        },
        getTimestamp() {
            return new Date().toISOString().match(/[0-9]+:[0-9]+:[0-9]+/)[0]
        },
        onOutputFromWindow(event) {
            this.writeLine(this.getTimestamp() + ': ' + event.detail)
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
    height: 100%;
    width: 100%;
}

#output {
    height: 100%;
    width: 100%;

    border-left: 3px solid#454545;
    border-bottom: 4px solid#454545;
}
</style>
