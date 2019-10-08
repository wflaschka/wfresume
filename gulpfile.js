// wflaschka 20170915 20191008
// gulp watch

var gulp                 = require('gulp');
var path                 = require('path');
var del                  = require('del');
var sass                 = require('gulp-sass');
var sourcemaps           = require('gulp-sourcemaps');
var util                 = require("gulp-util"); // https://github.com/gulpjs/gulp-util
var log                  = util.log;
var rename               = require('gulp-rename');


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
	images: [
		rootSource    + 'assets/images/**/*.*'
	],
	sass: [
        rootSource    + 'assets/styles/site.scss'
    ],
    semanticui: [
		'./Semantic-UI-2.2.13/dist/semantic.min.css'
	],
	html: [
		rootSource    + '**/*.htm?'
	]
};

// Options
var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
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
	// log("    - Generate CSS files " + (new Date()).toString());
	// log("    - Reading from: " + paths.sass);
	// log("    - Writing to: " + buildTargets.styles);
	return gulp
		.src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(sourcemaps.write('/maps'))
		.pipe(gulp.dest(buildTargets.styles))
		// .pipe(sassdoc(sassdocOptions))
		.resume();
});

// Images
gulp.task('images', function() {
	return gulp.src(paths.images)
		.pipe(gulp.dest(buildTargets.images));
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

// semanticui CSS
gulp.task('semanticui', function() {
	// // Build semantic-ui (actually fomantic-ui now) separately
	// // and just copy to dest
	// return gulp.src(paths.semanticui)
	// 	.pipe(gulp.dest(buildTargets.styles));
	//
	// Don't even build separately; version drift has broken the layout
	// Stick to SUI 2.2.13
	return gulp.src(paths.semanticui)
		.pipe(gulp.dest(buildTargets.styles));
});


gulp.task('watchpaths', function(){
	gulp.watch(paths.html, gulp.series('html'))
	gulp.watch(paths.scripts, gulp.series('scripts'))
	gulp.watch(paths.styles, gulp.series('styles'))
	gulp.watch(paths.semanticui, gulp.series('semanticui'))
	gulp.watch(paths.fonts, gulp.series('fonts'))
	gulp.watch(paths.sass, gulp.series('sass'))
	gulp.watch(paths.scripts, gulp.series('scripts'))
})

gulp.task('all', gulp.series('clean', 'images', 'scripts', 'styles', 'semanticui', 'sass', 'html', 'fonts'))

// gulp.task('default', gulp.series('watch'));
gulp.task('watch', gulp.series('all', 'watchpaths'))
