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

import City from './City'
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
        const editor = ace.edit(this.$refs.output)

        editor.setOptions({
            readOnly: true,
            showGutter: false,
            // showLineNumbers: false,
            vScrollBarAlwaysVisible: true,
            wrapBehavioursEnabled: true,
            
        })

        editor.setTheme('ace/theme/monokai')
        editor.session.setMode('ace/mode/markdown')
    },
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
}
</style>