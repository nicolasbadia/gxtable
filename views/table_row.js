// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC*/

/*
  Item view used by SC.TableView to draw one row.  This view calls
  SC.TableDelegate.renderTableCellContent() to allow custom cell rendering.
*/

SC.TableRowView = SC.View.extend(SC.Control, /*SC.Benchmark,*/ {

  // PUBLIC PROPERTIES
  
  classNames: 'sc-table-row-view',
  
  //verbose: YES, // for benchmarking
  
  
  /*
    @read-only
  */
  tableDelegate: function() {
    return this.getPath('displayDelegate.tableDelegate');
  }.property('displayDelegate').cacheable(),
  

	
  // PUBLIC METHODS


  contentPropertyDidChange: function(target, key) {
    this.displayDidChange();
  },

  render: function(context, firstTime) {
    //this.start('row render');
    
    var tableDelegate = this.get('tableDelegate'),
     		columns = this.getPath('displayDelegate.columns'),
     		left = 3, value, width,
     		content = this.get('content'),
     		contentIndex = this.get('contentIndex'),
     		classes = [(contentIndex % 2 === 0) ? 'even' : 'odd'];
    
    context = context.addClass(classes);
  	
    if (columns && columns.isEnumerable) {
			for (var index=0; index < columns.get('length'); index++) {
				col = columns.objectAt(index);
				
				// Add an observer on the keyPath (ex: bar.foo) to udate the UI even when you retrieve a record
				if (col.get('key').hasVal('.')) this.addObserver('content.'+col.get('key'), this, "displayDidChange");

        var iconKey = col.get('iconKey');
  
        width = col.get('width') || 0;
        context = context.push('<div class=\"cell col-%@ %@\" style=\"left: %@px; top: 0px; bottom: 0px; width: %@px;\">'.fmt(index, (iconKey ? 'has-icon' : ''), left, width));
        context = tableDelegate.renderTableCellContent(this, context, content, contentIndex, col, index, left, width);
        context = iconKey ? context.push('<div class=\"icon %@\"></div></div>'.fmt(content.get(iconKey))) : context.push('</div>');
  
        left += width;
      };
    }
  
    //this.end('row render');
  },

  mouseDown: function(evt) {
    var del = this.get('tableDelegate');
    
    if (del) {
      del.mouseDownOnTableRow(this.get('displayDelegate'), this, evt);
    }
    
    return NO;
  },
});

SC.TableRowView.mixin({
  isReusableInCollections: YES
});




SC.TableColumn = SC.Object.extend(SC.Column, {});


