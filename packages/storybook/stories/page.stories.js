import { withKnobs, number, boolean } from '@storybook/addon-knobs'
import { storiesOf, addDecorator } from '@storybook/vue'
import { linkTo } from '@storybook/addon-links'

import Page from '../src/Page'

import { createStore } from '../src/vuex-bootstrapper'

const store = createStore()

export default {
    title: 'Page',
}

addDecorator(withKnobs)

export const editor = () => ({
    store,
    props: {
        // showImages: {
        //     type: Boolean,
        //     default: () => boolean('showImages', false, 'visuals'),
        // },
        // randomizeBuildings: {
        //     type: Boolean,
        //     default: () => boolean('randomizeBuildings', false, 'visuals'),
        // },
        // initialSizeX: {
        //     type: Number,
        //     default: () => number('initialSizeX', 6, undefined, 'coords'),
        // },
        // initialSizeY: {
        //     type: Number,
        //     default: () => number('initialSizeY', 3, undefined, 'coords'),
        // },
        // initialFloors: {
        //     type: Number,
        //     default: () => number('initialFloors', 1, undefined, 'coords'),
        // },
        // maxSizeX: {
        //     type: Number,
        //     default: () => number('maxSizeX', 12, undefined, 'coords'),
        // },
        // maxSizeY: {
        //     type: Number,
        //     default: () => number('maxSizeY', 12, undefined, 'coords'),
        // },
    },
    mounted() {
        // let caughtProps = JSON.stringify(this.$props)
        // setInterval(function() {
        //     let newJson = JSON.stringify(this.$props)
        //     if (newJson !== caughtProps) {
        //         debugger;
        //         this.$forceUpdate()
        //     }
        //     caughtProps = JSON.stringify(this.$props)
        // }.bind(this), 100)
    },
    components: { Page },
    template: '<Page v-bind="$props" />',
    methods: { action: linkTo('Button') },
})

editor.story = {
    name: 'Page',
}
