// lazyload config

angular.module('app')
    /**
   * jQuery plugin config use ui-jq directive , config the js and css files that required
   * key: function name of the jQuery plugin
   * value: array of the css js file located
   */
  .constant('JQ_CONFIG', {
        easyPieChart: ['libs/jquery/charts/easypiechart/jquery.easy-pie-chart.js'],
        plot: ['libs/jquery/charts/flot/jquery.flot.min.js',
                          'libs/jquery/charts/flot/jquery.flot.resize.js',
                          'libs/jquery/charts/flot/jquery.flot.tooltip.min.js',
                          'libs/jquery/charts/flot/jquery.flot.spline.js',
                          'libs/jquery/charts/flot/jquery.flot.orderBars.js',
                          'libs/jquery/charts/flot/jquery.flot.pie.min.js'],
        chosen:         ['libs/jquery/chosen/chosen.jquery.min.js',
                          'libs/jquery/chosen/chosen.css'],
        treeview: ['vendor/bootstrap-treeview/dist/bootstrap-treeview.min.js',
            'vendor/bootstrap-treeview/dist/bootstrap-treeview.min.css']
      }
  )
  // oclazyload config
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
      // We configure ocLazyLoad to use the lib script.js as the async loader
      $ocLazyLoadProvider.config({
          debug:  false,
          events: true,
          modules: [
              {
                  name: 'ui.select',
                  files: [
                      'vendor/ui-select/dist/select.min.js',
                      'vendor/ui-select/dist/select.min.css'
                  ]
              },
              {
                  name:'angularFileUpload',
                  files: [
                    'vendor/angular-file-upload/angular-file-upload.min.js'
                  ]
              },
              {
                  name: 'ngImgCrop',
                  files: [
                      'vendor/ng-img-crop/compile/minified/ng-img-crop.js',
                      'vendor/ng-img-crop/compile/minified/ng-img-crop.css'
                  ]
              },
              {
                  name: "chosen",
                  files: [
                      'libs/jquery/chosen/chosen.jquery.min.js',
                      'libs/jquery/chosen/chosen.css'
                  ]
              }
          ]
      });
  }])
;