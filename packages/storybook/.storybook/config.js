import 'keen-ui/dist/keen-ui.css'
import 'material-design-icons'

import { configure } from '@storybook/vue'

// automatically import all files ending in *.stories.js
configure(require.context('../stories', true, /\.stories\.js$/), module)
