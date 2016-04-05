'use strict';

var $ = require('jquery'),
    marked = require('marked');

var Tab = require('./script/tab');

var t1 = new Tab.TodoTab('my todo tab');
var t2 = new Tab.NoteTab('my note tab');

