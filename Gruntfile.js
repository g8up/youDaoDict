 module.exports = function (grunt) {
 	grunt.initConfig({
 		pkg: grunt.file.readJSON('package.json'),
 		meta: {
 			banner: '/* Sigma Product */'
 		},
 		// 清空
 		clean: {
 			dist: 'dist'
 		},
 		copy: {
 			dist:{
	 			files: [
	 				// includes files within path
	 				{
	 					expand: true,
	 					cwd:'src/',
	 					src: ['*.png', '*.gif', 'manifest.json', 'options.html'],
	 					dest: 'dist/',
	 					filter: 'isFile'
	 				}
	 			]
 			}
 		},
 		// 代码压缩
 		uglify: {
 			dist: {
 				expand: true,
 				cwd: 'src',
 				src: ['**/*.js'],
 				dest: './dist/'
 			}
 		},
 		compress: {
 			zip: {
 				options: {
 					mode: 'zip',
 					archive: 'cws-yd<%= pkg.version %>.zip'
 				},
 				files: [{
 					expand: true,
 					cwd: 'dist/',
 					src: ['**'],
 					dest: ''
 				}]
 			}
 		}
 		// shell: {
 		// 	options: {
 		// 		stderr: false
 		// 	},
 		// 	target: {
 		// 		command: 'git archive --format zip --output release/cws-yd<%= pkg.version %>.zip newArch dist'
 		// 	},
 		// 	winzip: {
 		// 		command: 'makecab dist release/cws-yd<%= pkg.version %>.zip'
 		// 	}
 		// }
 	});
 	grunt.loadNpmTasks('grunt-contrib-clean');
 	grunt.loadNpmTasks('grunt-contrib-copy');
 	grunt.loadNpmTasks('grunt-contrib-uglify');
 	grunt.loadNpmTasks('grunt-contrib-compress');
 	// grunt.loadNpmTasks('grunt-shell');

 	grunt.registerTask('dist', ['clean:dist', 'uglify', 'copy']);
 	grunt.registerTask('release', ['clean:dist', 'uglify', 'compress']); //完整流程
 	grunt.registerTask('package', ['compress']); //仅打包
 };