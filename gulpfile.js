// wflaschka 20170915
// gulp watch

var gulp                 = require('gulp');
var path                 = require('path');
var concat               = require('gulp-concat');
var del                  = require('del');
var relative             = require('relative');
var debug                = require('gulp-debug');
var runSequence          = require('run-sequence');
var sass                 = require('gulp-sass');
var sourcemaps           = require('gulp-sourcemaps');
var autoprefixer         = require('gulp-autoprefixer');
var sassdoc              = require('sassdoc');
var util                 = require("gulp-util"); // https://github.com/gulpjs/gulp-util
var log                  = util.log;
var less                 = require('gulp-less');
var cleancss             = require('gulp-clean-css');
var csscomb              = require('gulp-csscomb');
var rename               = require('gulp-rename');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefix           = new LessPluginAutoPrefix({ browsers: ["last 4 versions"] });

// Paths
var rootTarget           = 'dist/';
var rootSource           = 'src/';

var buildTargets = {
	'scripts'     : rootTarget + 'assets/scripts'
	, 'images'    : rootTarget + 'assets/images'
	, 'styles'    : rootTarget + 'assets/styles'
	, 'fonts'     : rootTarget + 'assets/fonts'
	, 'html'      : rootTarget
	, 'fullbuild' : rootTarget
	, 'assets'    : rootTarget + 'assets/'
};
var paths = {
	scripts: [
		rootSource   + 'assets/scripts/**/*'
	],
	styles: [
		rootSource    + 'assets/styles/**/*.css'
	],
	fonts: [
		// rootSource    + 'assets/fonts/**/*'
		rootSource    + 'assets/fonts/icons.*',
		rootSource + 'assets/fonts/font-mfizz.*'
		// '!' + rootSource + 'assets/fonts/font-awesome',
	],
	pdfs: [
		rootSource    + 'assets/pdfs/**/*'
	],
	images: [
		rootSource    + 'assets/images/**/*.*'
	],
	sass: [
        rootSource    + 'assets/styles/site.scss'
    ],
    less: [
		'./semantic/src/semantic.less'
	],
	html: [
		rootSource    + '**/*.htm?'
	],
	shell: [
		rootSource + '**/*.sh'
	]
};

// Options
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};
var autoprefixerOptions = {
  browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
};
var sassdocOptions = {
  dest: buildTargets.styles + '/sassdoc'
};

////////////////////////////////////////////////////////////////////////////////////

// Clean target directory of everything
gulp.task('clean', function() {
	return del([buildTargets.fullbuild]);
});

// Javascripts
gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(gulp.dest(buildTargets.scripts));
});

// Styles
gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe(gulp.dest(buildTargets.styles));
});

// SASS
gulp.task('sass', function () {
	log("    - Generate CSS files " + (new Date()).toString());
	log("    - Reading from: " + paths.sass);
	log("    - Writing to: " + buildTargets.styles);

	return gulp
		.src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(sourcemaps.write('/maps'))
		.pipe(gulp.dest(buildTargets.styles))
		.pipe(sassdoc(sassdocOptions))
		.resume();
});

// Images
gulp.task('images', function() {
	return gulp.src(paths.images)
		.pipe(gulp.dest(buildTargets.images));
});

// PDFs
gulp.task('pdfs', function() {
	return gulp.src(paths.pdfs)
		.pipe(gulp.dest(buildTargets.pdfs));
});

// HTML
gulp.task('html', function() {
	return gulp.src(paths.html)
		.pipe(gulp.dest(buildTargets.html));
});

// FONTS
gulp.task('fonts', function() {
	return gulp.src(paths.fonts)
		.pipe(gulp.dest(buildTargets.fonts));
});

// Shell scripts
gulp.task('shell', function() {
	return gulp.src(paths.shell)
		.pipe(gulp.dest(buildTargets.shell));
});

// Less CSS
gulp.task('less', function() {
    gulp.src(paths.less)
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(csscomb())
        .pipe(gulp.dest(buildTargets.styles))
        .pipe(cleancss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(buildTargets.styles))
});

gulp.task('materializeJs', function() {
	return gulp.src(paths.materializeJs)
		.pipe(sourcemaps.init())
			.pipe(concat('materialize.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(buildTargets.scripts));
});

gulp.task('watch', ['all'], function() {
	gulp.watch(paths.images, ['images']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.styles, ['styles']);
	gulp.watch(paths.less, ['less']);
	gulp.watch(paths.html, ['html']);
	gulp.watch(paths.fonts, ['fonts']);
	gulp.watch(rootSource + '**/*.scss', ['sass']);
	gulp.watch(rootSource + '**/*.sass', ['sass']);
	gulp.watch(rootSource + '**/*.less', ['less']);
});

gulp.task('all', function(callback) {
    runSequence(
        'clean', 'images', 'scripts', 'styles',
        'less', 'sass', 'html', 
        'fonts',
        callback
    );
});

gulp.task('default', ['watch']);
