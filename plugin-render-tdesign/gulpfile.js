const gulp = require('gulp')
const fs = require('fs')
const del = require('del')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const replace = require('gulp-replace')
const concat = require('gulp-concat')
const dartSass = require('sass')
const gulpSass = require('gulp-sass')
const sass = gulpSass(dartSass)
const cleanCSS = require('gulp-clean-css')
const prefixer = require('gulp-autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const { rollup } = require('rollup')
const commonjs = require('@rollup/plugin-commonjs')
const ts = require('gulp-typescript')
const pack = require('./package.json')
const tsconfig = require('./tsconfig.json')

const tsSettings = {
  ...tsconfig.compilerOptions,
  target: 'es2016'
}

const exportModuleName = 'VxeUIPluginRenderTDesign'
const esmOutDir = 'es'
const commOutDir = 'lib'

// 已废弃
const oldOutDir = 'dist'

const pluginName = pack.name
const tableVersion = '3.9.0'
const pluginUrl = 'https://vxeui.com/other3/#/plugin-render-tdesign/install'

gulp.task('build_style', function () {
  return gulp.src('style.scss')
    .pipe(sass())
    .pipe(prefixer({
      borwsers: ['last 1 version', '> 1%', 'not ie <= 8'],
      cascade: true,
      remove: true
    }))
    .pipe(gulp.dest(esmOutDir))
    .pipe(gulp.dest(commOutDir))
    .pipe(gulp.dest(oldOutDir))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest(esmOutDir))
    .pipe(gulp.dest(commOutDir))
    .pipe(gulp.dest(oldOutDir))
})

gulp.task('build_ts', function () {
  return gulp.src(['src/**/*.ts'])
    .pipe(replace('VUE_APP_VXE_PLUGIN_VERSION', `${pluginName} ${pack.version}`))
    .pipe(replace('VUE_APP_VXE_TABLE_VERSION', `vxe-table ${tableVersion}`))
    .pipe(replace('VUE_APP_VXE_PLUGIN_DESCRIBE', `${pluginUrl}`))
    .pipe(ts(tsconfig.compilerOptions))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(gulp.dest(commOutDir))
})

gulp.task('build_escode', function () {
  return gulp.src('src/**/*.ts')
    .pipe(replace('VUE_APP_VXE_PLUGIN_VERSION', `${pluginName} ${pack.version}`))
    .pipe(replace('VUE_APP_VXE_TABLE_VERSION', `vxe-table ${tableVersion}`))
    .pipe(replace('VUE_APP_VXE_PLUGIN_DESCRIBE', `${pluginUrl}`))
    .pipe(ts(tsSettings))
    .pipe(gulp.dest(esmOutDir))
})

gulp.task('build_es', gulp.series('build_escode', function () {
  return gulp.src([`${esmOutDir}/index.js`])
    .pipe(rename({
      basename: 'index',
      extname: '.esm.js'
    }))
    .pipe(gulp.dest(esmOutDir))
}))

gulp.task('build_commonjs', function () {
  return gulp.src([`${commOutDir}/index.js`])
    .pipe(rename({
      basename: 'index',
      extname: '.common.js'
    }))
    .pipe(gulp.dest(commOutDir))
})

gulp.task('build_umd', gulp.series(async function () {
  const rollupConfig = {
    input: `${commOutDir}/index.js`,
    output: {
      file: `${commOutDir}/index.common.js`,
      format: 'umd',
      name: exportModuleName,
      globals: {
        vue: 'Vue',
        'xe-utils': 'XEUtils',
        dayjs: 'dayjs'
      }
    },
    plugins: [commonjs()],
    external: ['vue', 'xe-utils', 'dayjs']
  }

  const bundle = await rollup(rollupConfig)
  const { output } = await bundle.generate(rollupConfig.output)
  fs.writeFileSync(`${commOutDir}/index.umd.js`, output[0].code, 'utf-8')

  return gulp.src(`${commOutDir}/index.umd.js`)
    .pipe(gulp.dest(oldOutDir))
    .pipe(uglify())
    .pipe(rename({
      basename: 'index',
      suffix: '.umd.min',
      extname: '.js'
    }))
    .pipe(gulp.dest(commOutDir))
    .pipe(gulp.dest(oldOutDir))
}))

gulp.task('clear', () => {
  return del([
    esmOutDir,
    commOutDir,
    oldOutDir
  ])
})

gulp.task('build', gulp.series('clear', 'build_ts', gulp.parallel('build_es', 'build_commonjs', 'build_umd', 'build_style')))
