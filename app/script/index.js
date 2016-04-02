'use strict';

var $ = require('jquery'),
    marked = require('marked');

$(document).on('dblclick', '.content', function() {
  $('.content .markup').hide();
  $('.content .raw-text')
    .css({ display: 'block' })
    .focus();

});

$(document).on('keypress', '.content .raw-text', function(event) {
  if (event.keyCode === 10 && event.ctrlKey) {
    var raw_text = $('.content .raw-text').val(),
        marked_text = marked(raw_text);
    $('.content .raw-text').hide();
    $('.content .markup')
      .html(marked_text)
      .show();
  }
});
