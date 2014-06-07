var devDir = 'development/';
var destDir = 'public/';
var scriptsDir = 'scripts/';
var stylesDir = 'styles/';
var scriptFiles = [devDir+scriptsDir+'main.js'];
var report = "min";

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					loadPath: devDir + stylesDir,
					compass: 'config.rb',
					trace: true,
					style: 'compact',
					quiet: true
				},
				files: {
					'public/styles/<%= pkg.name %>.css': 'development/styles/main.scss',
				}
			}
		},
		cssmin: {
			options: {
				report: report,
				banner: '/*! <%= pkg.name %>  v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			combine: {
				src: destDir+stylesDir+"<%= pkg.name %>.css",
				dest: destDir+stylesDir+"<%= pkg.name %>.css"
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %>  v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				report: 'gzip',
				mangle: false,
				compress: true,
				beautify: {
					beautify: false,
					bracketize: true,
					width: 80
				},
				'screw-ie8': false
			},
			build: {
				src: devDir+scriptsDir+'main.js',
				dest: destDir+scriptsDir+'<%= pkg.name %>.min.js'
			}
		}, 
		watch: {
			scripts: {
				files: [devDir+scriptsDir+'*.js'],
				tasks: ['uglify']
			},
			styles: {
				files: [devDir+stylesDir+'*.scss'],
				tasks: ['sass']
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-sass');
	
	// Default task(s).
	grunt.registerTask('default', [/*'uglify',*/'sass','cssmin']);

};