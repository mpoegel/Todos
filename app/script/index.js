'use strict';

var $ = require('jquery'),
    marked = require('marked');

var Tab = require('./script/tab');
require('./script/menu');
require('./script/file');

var cached = false;
window.onbeforeunload = function(e) {
  if (! cached) {
    e.returnValue = false;
    Tab.saveCache(function() {
      cached = true;
      window.close();
    });
  }
}

Tab.restoreCache();

var allTabs = Tab.allTabs;
