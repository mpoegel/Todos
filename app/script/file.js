'use strict';

const dialog = require('electron').remote.dialog;
const fs = require('fs');

const Tab = require('./tab');

/**
 * 
 */
module.exports.openFileDialog = function() {
  dialog.showOpenDialog(function(filenames) {
    filenames.forEach(function(file) {
      var ext = file.split('.').slice(-1)[0];
      if (ext === 'tdo' || ext === 'todo') {
        new Tab.TodoTab('Untitled', (self) => { self.loadFile(file); });
      } else {
        new Tab.NoteTab('Untitled', (self) => { self.loadFile(file); });        
      }
    });
  });
}

/**
 * 
 */
module.exports.openSaveAsDialog = function(defaultPath) {
  dialog.showSaveDialog({
    defaultPath: defaultPath
  }, function(filename) {
    Tab.hardSave(filename);
  });
}

/**
 * 
 */
module.exports.confirmDialog = function(title, message, callback) {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Yes', 'No', 'Cancel'],
    title: title,
    message: message,
    cancelId: 2,
    noLink: true
  }, callback);
}
