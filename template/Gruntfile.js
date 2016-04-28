module.exports = function (grunt) {
    grunt.initConfig({
        path: {
            webui: {
                vendor: '{{path_webui_vendor}}'
            }
        },
        pkg: grunt.file.readJSON('{{path_package_js}}'),
        clean: {
            webuiVendor: ['<%= path.webui.vendor %>']
        },
        copy: {
            webuiVendor: {{copy_webui_vendor}}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.registerTask('default', [
        'copy:webuiVendor',
        'clean:webuiVendor'
    ]);
};
