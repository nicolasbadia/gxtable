// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// 
// 
// 
SC.TableDelegate = {

  isTableDelegate: YES,
	
	
	getSortKey: function(column, sortServer) {
		var sort = column.get('sort'),
				key = column.get('key');
		
		if (sortServer && column.get('sortServer')) return column.get('sortServer');
		else if (sort) return sort;
		else if (key === 'heureF' || key === 'dateF' || key === 'dateHeure') return 'date';
  	else return key;
  },
  

  tableDidRequestSort: function(tableView, content, column, columnIndex, direction) {
		var didSort = NO, key = this.getSortKey(column), order;
  	
    if (SC.kindOf(content, SC.ArrayController)) { 
			if (content.get('SPARSE')) {
				key = this.getSortKey(column, true);
				if (direction === SC.SORT_DIRECTION_ASCENDING) order = '%@ ASC'.fmt(key);
	      else if (direction === SC.SORT_DIRECTION_DESCENDING) order = '%@ DESC'.fmt(key);
				else order = content.get('ORDER');
				
				var query = SC.Query.remote(content.get('MODEL'), { conditions: content.get('_conditions'), parameters: content.get('_parametres'), orderBy: order, });
				content.set('content', GX.store.find(query));
				didSort = YES;
			}
			else {
				if (direction === SC.SORT_DIRECTION_ASCENDING) content.set('orderBy', 'ASC %@'.fmt(key));
	      else if (direction === SC.SORT_DIRECTION_DESCENDING) content.set('orderBy', 'DESC %@'.fmt(key));
	      else content.set('orderBy', null);
	      didSort = YES;
			}
      
    }
    else if (SC.typeOf(content) === SC.T_ARRAY) {
			content.sortProperty(key);
      if (direction === SC.SORT_DIRECTION_ASCENDING) content.reverse();
      if (content.isEnumerable) content.enumerableContentDidChange();
      didSort = YES;
    }
    
    // Update the view to show how we're sorting over now.
    if (didSort) {
      tableView.set('sort', { key: column.get('key'), direction: direction });
    }
		return YES;
  },

  renderTableCellContent: function(tableView, renderContext, rowContent, rowIndex, column, columnIndex) {
    return renderContext.push('<div class=\"text\">%@</div>'.fmt(SC.RenderContext.escapeHTML(rowContent ? rowContent.getPath(column.get('key')) : null)));
  },
  
  /*
    Called when a mouse-down occurs on a table row view.  'evt' is the original mouse event, so you can
    query it for the actual DOM target that was hit if desired.
  */
  mouseDownOnTableRow: function(tableView, rowView, evt) {
  },
	
	rightClicOnColumnHeader: function(controllers, view, evt) {
		if (controllers.openReglageColonne) controllers.openReglageColonne(view);
	},
	
	
	

  beginColumnResizeDrag: function(controller, evt, col, colIndex) {
  },
  
  updateColumnResizeDrag: function(controller, evt, col, colIndex, newWidth) {
		controller.updateColumnsProperties();
  },

	endColumnDrag: function(controllers) {
		controller.updateColumnsProperties();
	},
};

