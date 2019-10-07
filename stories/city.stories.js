import { withKnobs, number, boolean } from '@storybook/addon-knobs'
import { storiesOf, addDecorator } from '@storybook/vue'
import { linkTo } from '@storybook/addon-links'

import City from '../src/City'

export default {
    title: 'City',
}

addDecorator(withKnobs)

export const toStorybook = () => ({
    props: {
        sizeX: {
            type: Number,
            default: () => number('sizeX', 3),
        },
        sizeY: {
            type: Number,
            default: () => number('sizeY', 3),
        },
        maxSizeX: {
            type: Number,
            default: () => number('maxSizeX', 5),
        },
        maxSizeY: {
            type: Number,
            default: () => number('maxSizeY', 5),
        },
        initialFloors: {
            type: Number,
            default: () => number('initialFloors', 1),
        },
        showImages: {
            type: Number,
            default: () => boolean('showImages', true),
        },
        randomizeBuildings: {
            type: Number,
            default: () => boolean('randomizeBuildings', false),
        },
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
    components: { City },
    template: '<City v-bind="$props" />',
    methods: { action: linkTo('Button') },
})

toStorybook.story = {
    name: 'to Storybook',
}
