import pluginVue from "eslint-plugin-vue";

export default [
  ...pluginVue.configs["flat/vue2-essential"],
  // ...pluginVue.configs["flat/vue2-recommended"],
  {
    files: ["**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
    },
    rules: {
      "no-undef": "off",
      "no-unused-vars": "warn",
      "no-prototype-builtins": "off",
      "prefer-const": "off",
      "no-inner-declarations": "warn",
      "vue/attribute-hyphenation": "off",
      "vue/require-default-prop": "off",
      "vue/attributes-order": "off",
      "vue/no-mutating-props": "warn",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/html-self-closing": "off",
      "vue/html-closing-bracket-newline": "off",
      "vue/no-v-html": "off",
      "vue/html-indent": "off",
      "vue/v-slot-style": "off",
      "vue/multi-word-component-names": "off",
      "vue/valid-template-root": "off",
      "vue/no-deprecated-destroyed-lifecycle": "off",
      "vue/no-v-for-template-key-on-child": "off",
      "vue/no-deprecated-v-bind-sync": "off",
      "vue/prop-name-casing": "off",
      "vue/component-definition-name-casing": "off",
    },
  },
];
