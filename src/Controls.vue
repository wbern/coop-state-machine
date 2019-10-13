<template>
    <div class="city-controls">
        <ui-icon-button
            @click="$emit('back')"
            type="secondary"
            class="city-controls__icon"
            icon="skip_previous"
        ></ui-icon-button>
        <ui-icon-button
            @click="$emit('play')"
            type="primary"
            class="city-controls__icon"
            icon="play_arrow"
        ></ui-icon-button>
        <ui-icon-button
            @click="$emit('forward')"
            type="secondary"
            class="city-controls__icon"
            icon="skip_next"
        ></ui-icon-button>
    </div>
</template>
<script>
import { UiIconButton } from 'keen-ui'

export default {
    components: { UiIconButton },
}
</script>
<style scoped>
.city-controls__icon {
    margin: 0 4px;
}

.city-controls {
    display: flex;
    justify-content: center;
    margin: 4px 0;
}
</style>