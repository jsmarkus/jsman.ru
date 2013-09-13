module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dom_munger: {
            express_doc: {
                options: {
                    callback: function($) {
                        var $links = Array.prototype.slice.call($('a'));
                        $links.forEach(function(link) {
                            var $link = $(link);
                            $link.attr('href', unrussify($link.attr('href')));
                        });
                    }
                },
                files: [{
                    src: '_expressjs.com/ru-index.html',
                    dest: 'express-3/index.html'
                }, {
                    src: '_expressjs.com/ru-guide.html',
                    dest: 'express-3/guide.html'
                }, {
                    src: '_expressjs.com/ru-faq.html',
                    dest: 'express-3/faq.html'
                }, {
                    src: '_expressjs.com/ru-community.html',
                    dest: 'express-3/community.html'
                }, {
                    src: '_expressjs.com/ru-applications.html',
                    dest: 'express-3/applications.html'
                }, {
                    src: '_expressjs.com/ru-api.html',
                    dest: 'express-3/api.html'
                }]
            }
        },

        copy: {
            express_doc: {
                files: [{
                    expand: true,
                    cwd: '_expressjs.com/',
                    src: ['*.css', 'images/**', '*.js'],
                    dest: 'express-3/'
                }]
            }
        }

    });

    grunt.loadNpmTasks('grunt-dom-munger');
    grunt.loadNpmTasks('grunt-contrib-copy');
    // grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['dom_munger:express_doc', 'copy:express_doc']);

};


function unrussify(url) {
    if (!url) {
        return url;
    }
    if (url.match(/^http|https:/)) {
        return;
    }
    return url.replace(/\bru\-/, '');
}