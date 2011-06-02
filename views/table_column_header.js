// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC*/

/*
  Item view used by SC.TableHeaderView to render a column header view.
*/

SC.TableColumnHeaderView = SC.View.extend(SC.Control, {

  // PUBLIC PROPERTIES
  
  classNames: 'sc-table-column-header-view',
  
  /*
    Set to an SC.SORT_DIRECTION_ enumeration as defined in core.js.
  */
  sortDirection: null,

  displayProperties: ['sortDirection'],
	
  /*
    Min width for resize dragging.
  */
  minWidth: 21,

  
  // PUBLIC METHODS
  
  contentPropertyDidChange: function() {
    this.displayDidChange();
  },
  
  render: function(context, firstTime) {
    var sortClasses = ['sort-indicator'];
    var sortDirection = this.get('sortDirection');
    var classNames = this.getPath('content.classNames');

    if (!SC.none(sortDirection)) {
      sortClasses.push(sortDirection);
    }

    context = context.addClass('col-%@'.fmt(this.get('contentIndex')));
		
		if (sortClasses) {
			context = context.addClass(sortClasses);
		}

    if (classNames) {
      context = context.addClass(classNames);
    }

    context = context.begin('div').addClass('col-border').end();
    context = context.begin('div').addClass('col-name').text(this.getPath('content.label')).end();

    if (this.getPath('content.canSort')) {
      context = context.begin('div').addClass(sortClasses).end();
    }
    
    if (this.getPath('content.canResize')) {
      context = context.begin('div').addClass('resize-handle').end();
    }
  },
  
  /*
    Watch for actions on the resize handle div and feed them back to the table.
  */
  mouseDown: function(evt) {
    var ret = NO, parent = this._parent = this.get('parentView');
		
		if(evt.which == 3) {
			parent.invokeDelegateMethod('rightClicOnColumnHeader', this, evt);
      return YES;
    }

    if (evt.target.className === 'resize-handle') { // take over the event if we're clicking a resize handle
      this._mouseDownInfo = { startPageX: evt.pageX, startWidth: this.get('frame').width };

      parent.invokeDelegateMethod('beginColumnResizeDrag', evt, this.get('content'), this.get('contentIndex'));
      ret = YES;
    }

    return ret;
  },

	
  mouseDragged: function(evt) {
    var parent = this._parent, mouseDownInfo = this._mouseDownInfo, newWidth;
		
		if (mouseDownInfo) {
			newWidth = Math.max(mouseDownInfo.startWidth + evt.pageX - mouseDownInfo.startPageX, this.get('minWidth'));
			this.setPathIfChanged('content.width', newWidth);
	    parent.invokeDelegateMethod('updateColumnResizeDrag', evt, this.get('content'), this.get('contentIndex'), newWidth);
		}
    return YES;
  },
  
	
  
  // PRIVATE PROPERTIES
  _mouseDownInfo: null,
  _parent: null,
});
