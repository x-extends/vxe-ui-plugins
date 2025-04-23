const gulp = require('gulp')
const del = require('del')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const dartSass = require('sass')
const gulpSass = require('gulp-sass')
const sass = gulpSass(dartSass)
const cleanCSS = require('gulp-clean-css')
const prefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')
const pack = require('./package.json')
const tsconfig = require('./tsconfig.json')

const exportModuleName = 'VxeUIPluginValidator'
const pluginName = pack.name
const tableVersion = '4.7.0'
const pluginUrl = 'https://vxeui.com/other4/#/plugin-export-xlsx/install'

gulp.task('build_commonjs', function () {
  return gulp.src(['src/index.ts'])
    .pipe(replace('VUE_APP_VXE_PLUGIN_VERSION', `${pluginName} ${pack.version}`))
    .pipe(replace('VUE_APP_VXE_TABLE_VERSION', `vxe-table ${tableVersion}+`))
    .pipe(replace('VUE_APP_VXE_PLUGIN_DESCRIBE', `${pluginUrl}`))
    // .pipe(sourcemaps.init())
    .pipe(ts(tsconfig.compilerOptions))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(rename({
      basename: 'index',
      extname: '.common.js'
    }))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'))
})

gulp.task('build_umd', function () {
  return gulp.src(['src/index.ts'])
    .pipe(replace('VUE_APP_VXE_PLUGIN_VERSION', `${pluginName} ${pack.version}`))
    .pipe(replace('VUE_APP_VXE_TABLE_VERSION', `vxe-table ${tableVersion}+`))
    .pipe(replace('VUE_APP_VXE_PLUGIN_DESCRIBE', `${pluginUrl}`))
    .pipe(ts(tsconfig.compilerOptions))
    .pipe(babel({
      moduleId: pack.name,
      presets: [
        '@babel/env'
      ],
      plugins: [
        ['@babel/transform-modules-umd', {
          globals: {
            [pack.name]: exportModuleName,
            vue: 'Vue',
            'vxe-table': 'VXETable',
            'xe-utils': 'XEUtils'
          },
          exactGlobals: true
        }]
      ]
    }))
    .pipe(rename({
      basename: 'index',
      suffix: '.umd',
      extname: '.js'
    }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(rename({
      basename: 'index',
      suffix: '.umd.min',
      extname: '.js'
    }))
    .pipe(gulp.dest('dist'))
})

gulp.task('clear', () => {
  return del([
    'dist/depend.*'
  ])
})

gulp.task('build', gulp.series(gulp.parallel('build_commonjs', 'build_umd'), 'clear'))
