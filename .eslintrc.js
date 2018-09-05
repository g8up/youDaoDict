// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: ['airbnb-base'],
  plugins: [
    'vue', 'html'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    },
    'import/extensions': ['.js', '.es', '.jsx'],
  },
  'rules': {
    /* Waimai-BP-javascript-style-guide Custom Rules */
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'es': 'never',
      'jsx': 'never'
    }],

    // class-methods-use-this, https://eslint.org/docs/rules/class-methods-use-this
    'class-methods-use-this': 'off',

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    // suggest using template literals instead of string concatenation
    // http://eslint.org/docs/rules/prefer-template
    'prefer-template': 'warn',

    // disallow unnecessary string escaping
    // http://eslint.org/docs/rules/no-useless-escape
    'no-useless-escape': 'off',


    // use rest parameters instead of arguments
    // http://eslint.org/docs/rules/prefer-rest-params
    'prefer-rest-params': 'off',

    // suggest using the spread operator instead of .apply()
    // http://eslint.org/docs/rules/prefer-spread
    'prefer-spread': 'warn',

    // disallow arrow functions where they could be confused with comparisons
    // http://eslint.org/docs/rules/no-confusing-arrow
    'no-confusing-arrow': 'off',

    // disallow use of unary operators, ++ and --
    // http://eslint.org/docs/rules/no-plusplus
    'no-plusplus': 'off',

    // disallow dangling underscores in identifiers
    'no-underscore-dangle': ['warn', {
      allowAfterThis: false
    }],

    // enforce one true brace style
    'brace-style': ['error', 'stroustrup', {
      allowSingleLine: false
    }],

    // encourages use of dot notation whenever possible
    'dot-notation': ['warn', {
      allowKeywords: true
    }],
    // 推荐解构赋值
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    'prefer-destructuring': 'warn',
    'no-console': 'off',
    'indent': 'warn',
    'function-paren-newline': 'warn',
    'object-curly-newline': 'off',
    'camelcase': 'off',
    'no-new': 'off',
  }
}
