module.exports = {
  // http://eslint.org/docs/rules/

  "env": {
    "browser": true,      // browser global variables.
    "node": false,        // Node.js global variables and Node.js-specific rules.
    "worker": false,      // web workers global variables.
    "amd": false,         // defines require() and define() as global variables as per the amd spec.
    "mocha": false,       // adds all of the Mocha testing global variables.
    "jasmine": false,     // adds all of the Jasmine testing global variables for version 1.3 and 2.0.
    "phantomjs": false,   // phantomjs global variables.
    "jquery": false,      // jquery global variables.
    "prototypejs": false, // prototypejs global variables.
    "shelljs": false,     // shelljs global variables.
    "meteor": false,      // meteor global variables.
    "mongo": false,       // mongo global variables.
    "applescript": false, // applescript global variables.
    "es6": true,         // enable all ECMAScript 6 features except for modules.
  },

  "globals": {
    "chrome": true
  },
  "parserOptions": {
    "sourceType": "module",
  },
  "plugins": [
    // e.g. "react" (must run `npm install eslint-plugin-react` first)
  ],

  "rules": {

    // Possible Errors
    "no-extra-semi": 1,            // disallow unnecessary semicolons
    "no-inner-declarations": 2,    // disallow function or variable declarations in nested blocks


    // Best Practices
    "curly": 2,                 // specify curly brace conventions for all control statements
    "no-eval": 2,               // disallow use of eval()
    "no-extend-native": 2,      // disallow adding to native types
    "no-new-wrappers": 2,       // disallows creating new instances of String, Number, and Boolean
    "no-with": 2,               // disallow use of the with statement
    'indent': 'warn',

    // Strict Mode


    // Variables
    "no-undef": 2,                   // disallow use of undeclared variables unless mentioned in a /*global */ block


    // Node.js


    // Stylistic Issues
    "array-bracket-spacing": [2, "never"], // enforce spacing inside array brackets (off by default)
    "indent": [2, 2],                      // this option sets a specific tab width for your code (off by default)
    "no-array-constructor": 2,             // disallow use of the Array constructor
    "no-mixed-spaces-and-tabs": 2,         // disallow mixed spaces and tabs for indentation
    "no-new-object": 2,                    // disallow use of the Object constructor
    "object-curly-spacing": [2, "never"],  // require or disallow padding inside curly braces (off by default)
    "semi": 2,                             // require or disallow use of semicolons instead of ASI


    // ECMAScript 6

    // Legacy
    "max-len": [1, 80, 2] // specify the maximum length of a line in your program (off by default)
  }
}