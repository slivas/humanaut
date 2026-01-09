const { src, dest, watch, series } = require('gulp');
const sass         = require('gulp-sass')(require('sass'));
const sourcemaps   = require('gulp-sourcemaps');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync  = require('browser-sync').create();
const newer        = require('gulp-newer');
const babel        = require('gulp-babel');
const concat       = require('gulp-concat');
const terser       = require('gulp-terser');

const paths = {
    scss: {
        main: 'src/scss/main.scss',
        watch: 'src/scss/**/*.scss',
        dest: 'dist/css'
    },
    images: {
        src:  'src/images/**/*.{jpg,jpeg,png,svg,gif,webp}',
        dest: 'dist/images'
    },
    js: {
        src:  'src/js/**/*.js',
        dest: 'dist/js'
    },
    html: {
        src: '*.html'
    }
};

function styles() {
    return src(paths.scss.main)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(postcss([ autoprefixer() ]))
        .pipe(sourcemaps.write('.'))
        .pipe(dest(paths.scss.dest))
        .pipe(browserSync.stream());
}

function images() {
    return src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(dest(paths.images.dest))
        .pipe(browserSync.stream());
}

function scripts() {
    return src(paths.js.src, { sourcemaps: true })
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('main.js'))
        .pipe(terser())
        .pipe(dest(paths.js.dest, { sourcemaps: '.' }))
        .pipe(browserSync.stream());
}

function serve() {
    browserSync.init({ server: './' });
    watch(paths.scss.watch, styles);
    watch(paths.images.src, images);
    watch(paths.js.src, scripts);
    watch(paths.html.src).on('change', browserSync.reload);
}

exports.styles  = styles;
exports.images  = images;
exports.scripts = scripts;
exports.default = series(
    styles,
    images,
    scripts,
    serve
);
