// module.exports = {
//     globals: {
//         'vue-jest': {
//             babelConfig: {
//                 configFile: './babel.config.js',
//             },
//         },
//     },
//     moduleFileExtensions: ['js', 'json', 'vue'],
//     moduleNameMapper: {
//         '^@/(.*)$': '<rootDir>/src/$1',
//     },
//     transform: {
//         '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
//         '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
//     },
//     snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
//     transformIgnorePatterns: ['<rootDir>/node_modules/'],
// }

module.exports = {
    globals: {
        'vue-jest': {
            babelConfig: {
                configFile: './babel.config.js',
            },
        },
    },

    moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],

    transform: {
      '^.+\\.vue$': 'vue-jest',
      '^.+\\.(js|jsx)?$': 'babel-jest',
      '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
      '^.+\\.jsx?$': 'babel-jest'
    },

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    snapshotSerializers: ['jest-serializer-vue'],

    testMatch: [
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[jt]s?(x)',
      '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
    ],

    transformIgnorePatterns: [
      '<rootDir>/node_modules/',
      '/node_modules/'
    ],

    testMatch: [
        '**/__tests__/**/*.[jt]s?(x)',
        '**/?(*.)+(spec|test).[jt]s?(x)',
    ],

    testURL: 'http://localhost/',

    watchPlugins: [
      'jest-watch-typeahead/filename',
      'jest-watch-typeahead/testname'
    ]
}
