<template>
    <div class="wrapper">
        <div id="editor" ref="editor"></div>
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
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/webpack-resolver'
// import DiffMatchPatch from 'diff-match-patch'

// import ace from 'ace-builds/src/mode-javascript'
// import '!file-loader!ace-builds/src/'

export default {
    mounted() {
        const editor = ace.edit(this.$refs.editor)

        // Use this later for networking
        // You can also use the following properties:
        // DiffMatchPatch.DIFF_DELETE = 'remove'
        // DiffMatchPatch.DIFF_INSERT = 'insert'
        // DiffMatchPatch.DIFF_EQUAL = undefined;

        // const dmp = new DiffMatchPatch()

        // const diff = dmp.diff_main('dogs bark', 'cats bark')

        editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false,
        })

        editor.setTheme('ace/theme/monokai')
        editor.session.setMode('ace/mode/javascript')

        editor.session.on('change', function(text) {
            let e = editor
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

        editor.session.on('tokenizerUpdate', (a, e) => {
            // code has been parsed and annotations (warnings/errors) have been introduced
            if (
                editor.session &&
                editor.session.getAnnotations().length === 0
            ) {
                this.$emit('code-change', {
                    getText: () => editor.session.getValue(),
                })
            }
        })

        // editor.session.on('changeAnnotation', function(a, b) {
        //     console.log('changeAnnotation')
        // })
    },
    data: () => ({
        text: '',
    }),
}
</script>
<style scoped>
.wrapper {
    flex: 1;
    height: 100%;
    width: 100%;
}

#editor {
    height: 100%;
    width: 100%;
}
</style>