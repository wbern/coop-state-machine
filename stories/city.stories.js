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
        size: {
            type: Number,
            default: () => number('size', 10),
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
            default: () => boolean('randomizeBuildings', true),
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
