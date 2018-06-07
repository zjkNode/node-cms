var gulp = require('gulp'),
	rename = require('gulp-rename'),
	data = require('gulp-data'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	// nunjucks = require('gulp-nunjucks'),
	// nunjucks2 = require('nunjucks'),
	minCss = require('gulp-minify-css'),
	clean = require('gulp-clean'),
	browserSync = require('browser-sync'),
	nodemon = require('gulp-nodemon'),
	path = require('path'),
	express = require('express'),
	fs = require('fs'),
	less = require('gulp-less');

var proxy = require('http-proxy-middleware');
var mockServer = require('gulp-mock-server');
var px2rem = require('gulp-px2rem');
var archiver = require('gulp-archiver');

var files = [
	'./routers.js',
	'./src/mock/**/*.json',
	'./src/activity/components/**/*.html',
	'./src/activity/*.html',
	'./src/activity/components**/*.css',
	'./src/activity/components/**/*.js',
	'./src/static/**/**/*.*',
	'!./src/static/min.*',
	// './*.js'
];

gulp.task('mock', function() {
 	gulp.src('.')
		.pipe(mockServer({
			port: 7002,
			mockDir: './src/mock',
			allowCrossOrigin: true
   	}));
});

gulp.task('nodemon',function(){
	nodemon({
		script:'./server.js',
		ext:'html js json',
		// tasks:[],
		// ignore: [],
		// env:{
		// 	'NODE_ENV': 'development'
		// }
	}).on('restart',function(){
		console.log('restarted');
	});
})

gulp.task('server',['watch_list','nodemon'], function(){
	browserSync.init({
		port:7030,
		proxy:'http://localhost:7003',
		middleware: [
			proxy('/v1/apis', {
				target: 'https://test-activity.zhenggaofeng.com',
				changeOrigin: true,
				logLevel: 'debug',
				pathRewrite: {
					'^/v1/apis' : '/v1/apis',
				},
				// router: {'dev.localhost:3000': 'http://localhost:7002'},
			}),
			proxy('/temp', {
				target: 'http://localhost:7071',
				changeOrigin: true,
				logLevel: 'debug',
				pathRewrite: {
					'^/temp' : '/temp',
				},
				// router: {'dev.localhost:3000': 'http://localhost:7002'},
			})
		],
		reloadDelay: 1000,
		notify: false
	});
	
     //每当有文件改变刷新页面
	gulp.watch(files).on('change',browserSync.reload);
});


// css 压缩 
var px2remOptions = {//https://github.com/ggkovacs/node-px2rem
	rootValue: 75,
	propertyBlackList: ['font-size','border', 'max-width', 'min-width', 'min-height'],
    replace: true
};
 
var postCssOptions = {//https://github.com/postcss/postcss
    map: true  
};
gulp.task('css', function() {
	return gulp.src('./src/activity/**/*.css')
		// .pipe(minCss())
		// .pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest('dist'));
	
});
gulp.task('commonCss', function() {
	var distPath = './dist/static/css';
	var cssFiles = './src/static/css/**/*.css';
	return gulp.src(cssFiles)
		.pipe(minCss())
		// .pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest(distPath));
	
});
//less
gulp.task('lessc', function () {
    gulp.src('./src/activity/components/**/*.less')
		.pipe(less())
        .pipe(px2rem(px2remOptions, postCssOptions))
		.pipe(gulp.dest('src/activity/components'));
});

gulp.task('watch_list',['lessc'],function(){
	gulp.watch('./src/activity/components/**/*.less',['lessc'])
});



// tplJs 压缩  
gulp.task('js', function() {
	gulp.src('./src/activity/**/*.js')
		.pipe(gulp.dest('dist'));
});

// js 压缩  
gulp.task('commonJs', function() {
	var distPath = './dist/static/js';
	var jsFiles = './src/static/js/**/*.js';

	return gulp.src(jsFiles)
		//.pipe(uglify())
		// .pipe(rename({suffix:'.min'}))
		.pipe(gulp.dest(distPath));
});

// favicon.ico 拷贝  
gulp.task('ico', function() {
	var distPath = './dist';
	var icoFiles = './src/favicon.ico';

	return gulp.src(icoFiles)
		.pipe(gulp.dest(distPath));
});

// gulp.task('img',function(){
// 	var distPath = './dist/components';
// 	var imgFiles = './src/activity/components/*/img/*.*';

// 	return gulp.src(imgFiles)
// 			.pipe(gulp.dest(distPath));
// });

// nunjucks 编译页面
gulp.task('template',function() {
	var pages = ['./src/activity/**/*.html',
				 '!./src/activity/partials/**/*',
				 '!./src/activity/index.html'
				];
	// var env = nunjucks2.configure(path.join(__dirname,'src/activity'),{
	// 	autoescape:true,
	// 	tags: {
	// 		variableStart: '<$',
	// 		variableEnd: '$>',
	// 	}
	// });
	return gulp.src(pages)
			// .pipe(data(() => ({username:"app test"})))
			// .pipe(nunjucks.compile(null,{
			// 		tags: {
			// 			variableStart: '<$',
			// 			variableEnd: '$>',
			// 		}
			// 		,env:env
			// 	}))
			// .pipe(rename({extname:'.html'}))
			.pipe(gulp.dest('dist'));
});

gulp.task('clean',function(){
	return gulp.src('./dist')
			   .pipe(clean());
});

gulp.task('zip',['build'],function () {//压缩功能
	//延迟函数——目的：在读取目录之前，生成dist;
	setTimeout(function(){
		var files = fs.readdirSync('dist/components');
		files.forEach((file)=>{
			var filePath = path.normalize(__dirname + '/dist/components/' + file);
			var stat = fs.statSync(filePath);
			if(stat.isDirectory() && file !== 'static'){
				gulp.src(filePath+'/**')
					.pipe(archiver(file+'.zip'))
					.pipe(gulp.dest(filePath));
			}
		});
	}, 3000);
});
gulp.task('build',['clean'],function(){
	gulp.start('lessc','css','js','commonCss','commonJs', 'template','ico')
});


