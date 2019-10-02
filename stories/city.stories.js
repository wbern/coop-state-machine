import { linkTo } from "@storybook/addon-links";

import HelloWorld from "../src/components/HelloWorld";

export default {
  title: "HelloWorld"
};

export const toStorybook = () => ({
  components: { HelloWorld },
  template: '<HelloWorld :showApp="action" />',
  methods: { action: linkTo("Button") }
});

toStorybook.story = {
  name: "to Storybook"
};
