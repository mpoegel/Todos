'use strict';

const Mustache = require('mustache');
const _ = require('underscore');
const $ = require('jquery');
const fs = require('fs');
const storage = require('electron-json-storage');

var allTabs = {};
module.exports.allTabs = allTabs;

/**
 * 
 */
class Tab 
{
  /**
   * 
   */
  constructor(name) 
  {
    var self = this;
    self.name = name;
    self.active = false;
    self.filepath = undefined;
    self.filename = undefined;
    if (constructor.uuid === undefined) { constructor.uuid = 1000; }
    self.uuid = constructor.uuid++;
    /*  */
    $.get('./templates/tab.mst', function(template) {
      self.tab = Mustache.render(template, {
        uuid: self.uuid,
        name: self.name
      });
      $('.tabs').prepend( self.tab );
      _.each(allTabs, function(tab, uuid, list) { tab.setInactive(); });
      allTabs[ self.uuid ] = self;
      /*  */
      $(document).on('click', '.tab#' + self.uuid, function() { 
        self.setActive();
      });
      self.setActive();
      $(document).on('click', '.tab#' + self.uuid + ' .close', function(event) {
        try { self.hardSave(); } catch (e) {}
        delete allTabs[self.uuid];
        $('.tab#' + self.uuid).remove();
        var tab_uuids = _.allKeys(allTabs);
        if (tab_uuids.length === 0) {
          $('.content').html('');
          return;
        }
        allTabs[ tab_uuids[0] ].setActive();
        event.preventDefault();
      });      
      $(document).on('dblclick', '.content', function() {
        $('.content .markup').hide();
        $('.content .raw-text')
          .css({ display: 'block' })
          .focus();
      });
      /*  */
      $(document).on('dblclick', '.tab#' + self.uuid, function() {
        $('.tab#' + self.uuid + ' .label').hide();
        $('.tab#' + self.uuid + ' input')
          .show()
          .focus();
      });
      /*  */
      $(document).on('blur', '.tab#' + self.uuid, function() {
        var new_name = $('.tab#' + self.uuid + ' input')
              .hide()
              .val();
        self.name = new_name;
        $('.tab#' + self.uuid + ' .label')
          .text( new_name )
          .show();
      });
    });
  }
  
  /**
   * 
   */
  static hardSave(filepath) {
    _.each(allTabs, function(tab, uuid, list) {
      if (tab.active) {
        tab.hardSave(filepath);
        return;
      }
    });
  }
  
  /**
   * 
   */
  static getFileType() {
    var res = undefined;
    _.each(allTabs, function(tab, uuid, list) {
      if (tab.active) {
        res = tab.getFileType();
        return;
      }
    });
    return res;
   }
   
   /**
    * 
    */
   static getFilePath() {
     var res = undefined;
     _.each(allTabs, function(tab, uuid, list) {
      if (tab.active) {
        res = tab.filepath || tab.name + '.' + tab.getFileType();
        return;
      }
    });
    return res;
   }
  
  /**
   * 
   */
  loadFile() { throw 'Not yet implemented'; }
  
  /**
   * 
   */
  hardSave() { throw 'Not yet implemented'; }
  
  /**
   * 
   */
  setActive() 
  {
    var self = this;
    if (self.active) return;
    _.each(allTabs, function(tab, uuid, list) {
      if (tab.active) tab.softSave();
      if (uuid != self.uuid) tab.setInactive(tab);
    });
    self.softLoad();
    $( '.tab#' + self.uuid  ).addClass('active');
    self.active = true;
  }
  
  /**
   * 
   */
  setInactive() 
  {
    var self = this;
    self.active = false;
    $( '.tab#' + self.uuid ).removeClass('active');
  }
  
  /**
   * 
   */
  softSave() 
  {
    var self = this;
    self.body = $('.content').html();
  }
  
  /**
   * 
   */
  softLoad() 
  {
    var self = this;
    $('.content').html( self.body );    
  }
  
  /**
   * 
   */
  getData() { throw 'Not yet implemented'; }
  
  /**
   * 
   */
  getType() { throw 'Note yet implemented'; }
  
}

/* export static Tab methods only */
module.exports.hardSave = Tab.hardSave;
module.exports.getFileType = Tab.getFileType;
module.exports.getFilePath = Tab.getFilePath;


/**
 * 
 */
class NoteTab extends Tab 
{
  /**
   * 
   */
  constructor(name, cb) 
  {
    super(name);
    var self = this;
    cb = cb || _.noop;
    self.raw_text = '';
    $.get('./templates/note_body.mst', function(template) {
      self.body = Mustache.render(template, {
        uuid: self.uuid
      });
      $('.content').html( self.body );
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
          self.raw_text = raw_text;
          $('.content .raw-text').hide();
          $('.content .markup')
            .html(marked_text)
            .show();
          self.body = $('.content').html();
        }
      });
      cb(self);
    });
  }
  
  /**
   * 
   */
  loadFile(file) 
  {
    var self = this;
    fs.readFile(file, 'utf-8', function(err, data) {
      if (err) throw err;
      var file_parts = file.split('.'),
          name = file_parts.slice(0, -1).join('.').split('\\').slice(-1)[0],
          ext = file_parts.slice(-1)[0];
      self.name = name;
      self.filename = name + '.' + ext;
      self.filepath = file;
      $('.tab#' + self.uuid).text( self.name );
      self.raw_text = data;
      $('.content .raw-text').val( self.raw_text );
      var marked_text = marked(self.raw_text);
      $('.content .markup').html( marked_text );
      self.softSave();
    });
  }
  
  /**
   * 
   */
  hardSave(file) 
  {
    var self = this;
    file = file || self.filepath;
    if (file === undefined) throw 'Filepath undefined';
    fs.writeFile(file, self.raw_text, 'utf-8', function(err) {
      if (err) throw err;
    });
  }
  
  /**
   * 
   */
  softSave() 
  {
    var self = this;
    self.body = $('.content').html();
    self.raw_text = $('.content .raw-text').val();
  }
  
  /**
   * 
   */
  softLoad() 
  {
    var self = this;
    $('.content').html( self.body );
    $('.content .raw-text').val( self.raw_text );
  }
  
  /**
   * 
   */
  getFileType() { return 'md'; }
  
  /**
   * 
   */
  getData() 
  {
    var self = this;
    return {
      raw_text: self.raw_text,
      body: self.body
    };
  }
  
  /**
   * 
   */
  getType() { return 'note'; }
    
}
module.exports.NoteTab = NoteTab;


/**
 * 
 */
class TodoTab extends Tab 
{
  /**
   * 
   */
  constructor(name) 
  {
    super(name);
    var self = this;
    $.get('./templates/todo_body.mst', function(template) {
      self.body = Mustache.render(template, {
        uuid: self.uuid
      });
      $('.content').html( self.body );
    });
  }
  
  /**
   * 
   */
  getFileType() { return 'todo'; }
  
  /**
   * 
   */
  getData() 
  { 
    return {}; 
  }
  
  /**
   * 
   */
  getType() { return 'todo'; }
  
}
module.exports.TodoTab = TodoTab;


/**
 * 
 */
module.exports.saveCache = function(callback) {
  var open_files = [];
  _.each(allTabs, function(tab, uuid, list) {
    if (tab.active) tab.softSave();
    open_files.push({
      uuid: uuid,
      type: tab.getType(),
      name: tab.name,
      filename: tab.filename,
      filepath: tab.filepath,
      data: tab.getData()
    });
  });
  storage.set('tab_data', open_files, callback);
}

/**
 * 
 */
module.exports.restoreCache = function() {
  storage.get('tab_data', function(error, cached_files) {
    _.each(cached_files, function(d, list) {
      if (d.type === 'note') {
        var tab = new NoteTab(d.name, function(self) {
          self.filename = d.filename;
          self.filepath = d.filepath;
          self.raw_text = d.data.raw_text;
          self.body = d.data.body;
          $('.content').attr('id', self.uuid);
          self.softLoad();
        });
      } else if (d.type === 'todo') {
        var tab = new TodoTab(d.name);
        tab.filename = d.filename;
        tab.filepath = d.filepath;
      }
    });
  });
}

module.exports.storage = storage;
