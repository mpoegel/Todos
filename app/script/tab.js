'use strict';

var Mustache = require('mustache'),
    _ = require('underscore');
    $ = require('jquery');

var allTabs = {};

/**
 * 
 */
class Tab {
  /**
   * 
   */
  constructor(name) {
    var self = this;
    self.name = name;
    self.active = false;
    if (constructor.uuid === undefined) { constructor.uuid = 1000; }
    self.uuid = constructor.uuid++;
    $.get('./templates/tab.mst', function(template) {
      self.tab = Mustache.render(template, {
        uuid: self.uuid,
        name: self.name
      });
      $('.tabs').prepend( self.tab );
      _.each(allTabs, function(tab, uuid, list) { tab.setInactive(); });
      allTabs[ self.uuid ] = self;
      $(document).on('click', '.tab#' + self.uuid, 
        function() { self.setActive(); });
      self.setActive();
    });
  }
  
  /**
   * 
   */
  setActive() {
    var self = this;
    if (self.active) return;
    _.each(allTabs, function(tab, uuid, list) {
      if (uuid != self.uuid) tab.setInactive(tab);
    });
    self.softLoad();
    $( '.tab#' + self.uuid  ).addClass('active');
  }
  
  /**
   * 
   */
  setInactive() {
    var self = this;
    self.active = false;
    self.softSave();
    $( '.tab#' + self.uuid ).removeClass('active');
  }
  
  /**
   * 
   */
  softSave() {
    var self = this;
    self.body = $('.content').html();
  }
  
  /**
   * 
   */
  softLoad() {
    var self = this;
    $('.content').html( self.body );    
  }
  
}


/**
 * 
 */
class NoteTab extends Tab {
  /**
   * 
   */
  constructor(name) {
    super(name);
    var self = this;
    self.raw_text = '';
    $.get('./templates/note_body.mst', function(template) {
      self.body = Mustache.render(template, {
        uuid: self.uuid
      });
      $('.content').html( self.body );
    });
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
  }
  
  /**
   * 
   */
  softSave() {
    var self = this;
    self.body = $('.content').html();
    self.raw_text = $('.content .raw-text').val();
  }
  
  /**
   * 
   */
  softLoad() {
    var self = this;
    $('.content').html( self.body );
    $('.content .raw-text').val( self.raw_text );
  }
  
}
module.exports.NoteTab = NoteTab;


/**
 * 
 */
class TodoTab extends Tab {
  /**
   * 
   */
  constructor(name) {
    super(name);
    var self = this;
    $.get('./templates/todo_body.mst', function(template) {
      self.body = Mustache.render(template, {
        uuid: self.uuid
      });
      $('.content').html( self.body );
    });
  }
  
}
module.exports.TodoTab = TodoTab;
