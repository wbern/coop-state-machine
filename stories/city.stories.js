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
        showImages: {
            type: Boolean,
            default: () => boolean('showImages', false, 'visuals'),
        },
        randomizeBuildings: {
            type: Boolean,
            default: () => boolean('randomizeBuildings', false, 'visuals'),
        },
        initialSizeX: {
            type: Number,
            default: () => number('initialSizeX', 6, undefined, 'coords'),
        },
        initialSizeY: {
            type: Number,
            default: () => number('initialSizeY', 3, undefined, 'coords'),
        },
        initialFloors: {
            type: Number,
            default: () => number('initialFloors', 1, undefined, 'coords'),
        },
        maxSizeX: {
            type: Number,
            default: () => number('maxSizeX', 12, undefined, 'coords'),
        },
        maxSizeY: {
            type: Number,
            default: () => number('maxSizeY', 12, undefined, 'coords'),
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
