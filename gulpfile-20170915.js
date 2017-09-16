var gulp             = require('gulp');
var sass             = require('gulp-sass');
var sourcemaps       = require('gulp-sourcemaps');
var autoprefixer     = require('gulp-autoprefixer');
var shell            = require('gulp-shell');
var watch            = require('gulp-watch');
var gutil            = require('gulp-util');
var plumber          = require('gulp-plumber');
var connect          = require('gulp-connect');
var concat           = require('gulp-concat');
var uglify           = require('gulp-uglify');
// var uglify           = require('gulp-uglify-es');
var cssnano          = require('gulp-cssnano');
var imagemin         = require('gulp-imagemin');
var rev              = require('gulp-rev');
var buffer           = require('gulp-buffer');
var revCollector     = require('gulp-rev-collector');
var htmlmin          = require('gulp-htmlmin');
var rename           = require('gulp-rename');
var include          = require("gulp-include");
var requireDir       = require('require-dir'); // http://macr.ae/article/splitting-gulpfile-multiple-files.html
 
requireDir('./gulp-tasks');
// TODO: Handle ./vendor conditional or partial includes

var hugoTheme    = null;
// var hugoCommand = 'hugo --buildDrafts'; // Original
// var hugoCommand = 'hugo --buildDrafts --ignoreCache'; // Regular
var hugoCommand = 'hugo --ignoreCache';

// var sassInput    = './stylesheets/**/*.scss'; // Original
var sassInput    = './stylesheets/**/site.scss';
var sassInputAll = './stylesheets/**/*.scss';
var sassOutput   = './public/css'; // original

var jsInput = [
    './scripts/site-custom.js' // First!
    ,'./scripts/*.js'
    ,'./vendor/velocity.min.js'
    ,'./vendor/lunr.js'
    ,'./stylesheets/materialize-css/js/**/*'
    ,'!./stylesheets/materialize-css/js/velocity.min.js'
    ,'!./stylesheets/materialize-css/js/date_picker/**/*' // causing problems
    // But not any big standalones that could use
    // separate versioning or CDN:
    ,'!./scripts/**/jquery*'
    ,'!./scripts/vendor'
];
// WF
var jsCopy = [
    './scripts/jquery*.js'
    ,'./vendor/css-element-queries/src/*.js'
    ,'./vendor/slick/slick.min.js'
];
var jsOutput = './public/js';

var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

var hugoInput = [
    './archetypes/**/*.*',
    './content/**/*.*',
    './layouts/**/*.*',
    './static/**/*.*',
    './themes/**/*.*',
    './config.tml'
];

var imageInput = './static/img/**/*';
var imageOutput = './public/img';

var configDevFile = './config.dev.toml';
var configProdFile = './config.prod.toml';



gulp.task('default', ['serve']);


gulp.task('build', ['hugo', 'sass', 'js', 'js-copy', 'img', 'html']);

gulp.task('hugo', function() {
    return buildHugo();
});

gulp.task('sass', function() {
    return buildSass();
});

gulp.task('js', function() {
    return buildJs();
});

// wf
gulp.task('js-copy', function() {
    return copyJS();
});

gulp.task('img', function() {
    return buildImages();
});

gulp.task('html', function() {
    return buildHtml();
});

gulp.task('config-dev', function() {
    return changeConfigFile(configDevFile);
});

gulp.task('config-prod', function() {
    return changeConfigFile(configProdFile);
});

gulp.task('watch', function() {

    changeConfigFile(configDevFile);
    buildHugo();
    buildSass();
    buildJs();

    watch(sassInput, function (vinyl) {
        gutil.log(gutil.colors.green(vinyl.relative), 'fired', gutil.colors.green(vinyl.event));
        return buildSass().pipe(connect.reload());
    });
    watch(sassInputAll, function (vinyl) {
        gutil.log(gutil.colors.green(vinyl.relative), 'fired', gutil.colors.green(vinyl.event));
        return buildSass().pipe(connect.reload());
    });
    watch(jsInput, function (vinyl) {
        gutil.log(gutil.colors.green(vinyl.relative), 'fired', gutil.colors.green(vinyl.event));
        return buildJs().pipe(connect.reload());
    });
    watch(hugoInput, function (vinyl) {
        gutil.log(gutil.colors.green(vinyl.relative), 'fired', gutil.colors.green(vinyl.event));
        return buildHugo().pipe(connect.reload());
    });
});

gulp.task('serve', function() {
    connect.server({
            'root': 'public',
            'livereload': true,
            'port': 6789
    });
    gulp.start('watch');
});

function buildHugo() {
    // var hugoCommand = 'hugo --buildDrafts';

    if (hugoTheme) {
        hugoCommand += ' --theme=' + hugoTheme;
    }

    return gulp
        .src('')
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(shell([
            hugoCommand
        ]
    ));
}

function buildSass() {
    return gulp
        .src(sassInput)
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        .pipe(cssnano())
        .pipe(buffer())
        // .pipe(rev())
        .pipe(gulp.dest(sassOutput))
        // .pipe(rev.manifest({
        //     base: sassOutput,
        //     merge: true
        // }))
        ;
}

// wflaschka
function copyJS() {
    return gulp.src(jsCopy)
        .pipe(gulp.dest(jsOutput))
    ;
}

function buildJs() {
    return gulp.src(jsInput)
        .pipe(plumber({
            errorHandler: handleError
        }))
        .pipe(concat('site.js'))
        // .pipe(uglify())
        // VIA: https://stackoverflow.com/questions/39019545/materialize-css-uncaught-typeerror-vel-is-not-a-function/39913108#39913108
//        .pipe(uglify({mangle: false}))
        //  new webpack.optimize.UglifyJsPlugin({sourceMap: true, mangle: false})

        .pipe(buffer())
        // .pipe(rev())
        .pipe(gulp.dest(jsOutput))
        // .pipe(rev.manifest({
        //     base: jsOutput,
        //     merge: true
        // }))
        ;
}

function buildImages() {
    return gulp.src(imageInput)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ]
        }))
        .pipe(gulp.dest(imageOutput));
}

function buildHtml() {
    return gulp
        .src(['./rev-manifest.json', './public/**/*.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('public'));
}

function handleError(error) {
    gutil.beep();
    var message = null;
    if (error.hasOwnProperty('formatted')) {
        message = error.formatted;
    } else {
        message = error;
    }
    gutil.log(gutil.colors.red(message));
    this.emit('end');
}

function changeConfigFile(newConfigFile) {
    return gulp.src(newConfigFile)
        .pipe(rename('config.toml'))
        .pipe(gulp.dest('./'));
}
