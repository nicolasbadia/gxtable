// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC*/

sc_require('views/table_row');
sc_require('views/table_header');

/*
  A TableView for viewing tabular data using Sproutcore.
  
  Connect an array of row objects to the 'content' property.
  Define your column set by connecting an array of objects mixin in
  SC.Column to the 'columns' property.  Each of which may be a binding
  to an array controller if you wish.
  
  NOTES:
  * Currently the table is read-only; an editable version is coming!

*/

SC.TableView = SC.View.extend(SC.TableDelegate, {

  // PUBLIC PROPERTIES
  
  classNames: 'sc-table-view',

	// ................................................................................................
  // ROWS
  //

  /*
    Array of row content.  May be bound to an array controller if desired.
  */
  content: null,

  /*
    SC.SelectionSet
    The selected row(s).
  */
  selection: null,

  /*
    Row height in pixels.
  */
  rowHeight: 20,
	

  showAlternatingRows: YES,
	

	canReorderContent: NO,
  /*
    Target for action fired when double-clicking on a row
  */
  target: null,

  /*
    Action to be fired when double-clicking on a row
  */
  action: null,

  /*
    @read-only
  */
  isVerticalScrollerVisible: YES,

	// ................................................................................................
  // COLUMNS
  //

	/*
    Array of column objects (each should mix in SC.Column).  May be bound
    to an array controller if desired.
  */
  columns: [],


  /*
    YES if columns can be reordered by dragging.
  */
  canReorderColumns: YES,

  /*
    Set this to show which column is being sorted in which direction.
    
    ** This property is for view purposes only -- it does not actually cause any sorting
    to take place.  You have to sort your data yourself, then set this property to show
    what you did. **
    
    Should be a hash of the form:
    
      {
        key: '(property name on which to sort)',
        direction: SC.SORT_DIRECTION_ enumeration (see core.js for available definitions)
      }
      
    Note that the inner properties of this hash are not observed, so to change them,
    you should set the entire hash to a new object.
  */
  sort: null,

  /*
    Height of the header view in pixels.
  */
  headerHeight: 22,

  //////////////////////
  // Display
  //////////////////////

  /*
    Optional -- set to an object mixing in SC.TableDelegate to override
    certain table functionality, such as sorting and table cell rendering.
  */
  delegate: null,
  

	/*
    We register the tableView in the controller with TABLE_VIEW
  */
	init: function() {
		sc_super();
		var controllers = SC.objectForPropertyPath(this.getPath('contentBinding._fromPropertyPath').replace('.arrangedObjects', ''));
		if (controllers) {
			controllers.set('TABLE_VIEW', this);
		}
	},
	
	
  /*
    @read-only
    For internal use.  The various components of the table view query this
    property for a delegate object mixing in SC.TableDelegate.  This property
    tries several possibilities in this order:
    
      1. The 'delegate' property above
      2. The 'content' property above (this would usually be via a content-providing array controller having the mixin)
      3. This TableView itself, which always has the mixin as a last resort.
  */
  tableDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isTableDelegate', del, content); // defaults to 'this' if neither 'del' or 'content' have the SC.TableDelegate mixin
  }.property('delegate', 'content').cacheable(),

  /*
    @read-only
    The sum of the column widths.
  */
  tableWidth: function() {
    var columns = this.get('columns');
    var ret = 0;

    if (columns && columns.isEnumerable) {
      columns.forEach(function(col) {
        ret += (col.get('width') || 0);
      }, this);
    }

    return ret;
  }.property().cacheable(),

  // PUBLIC METHODS

  createChildViews: function() {
    var childViews = [], headerScrollView, bodyScrollView;
    var headerHeight = this.get('headerHeight');
    var tableWidth = this.get('tableWidth');

    bodyScrollView = this.createChildView(SC.ScrollView, {
      classNames: 'sc-table-body-scroll-view',
      layout: { left: 0, right: 0, top: headerHeight, bottom: 0 },
      contentView: SC.ListView.extend(/*SC.Benchmark,*/ {
        //verbose: YES, // for benchmarking
        layout: { right: 0, minWidth: tableWidth },
        contentBinding: SC.Binding.from('content', this),
				columns: [],
        columnsBinding: SC.Binding.from('columns', this),
        selectionBinding: SC.Binding.from('selection', this),
        contentValueKey: 'label',
        exampleView: SC.TableRowView,
        rowHeight: this.get('rowHeight'),
				tableDelegate: null,
        tableDelegateBinding: SC.Binding.from('tableDelegate', this).oneWay(),
        showAlternatingRowsBinding: SC.Binding.from('showAlternatingRows', this).oneWay(),
        targetBinding: SC.Binding.from('target', this).oneWay(),
        actionBinding: SC.Binding.from('action', this).oneWay(),
        canReorderContentBinding: SC.Binding.from('canReorderContent', this).oneWay(),
        /* For Benchmarking */
        // reloadIfNeeded: function() {
        //   this.start('reloadIfNeeded');
        //   sc_super();
        //   this.end('reloadIfNeeded');
        // }
      }),

      isVerticalScrollerVisibleBinding: SC.Binding.from('isVerticalScrollerVisible', this)
    });
    this._bodyScrollView = bodyScrollView;
    this._bodyView = bodyScrollView.get('contentView');
		
		// Afin que le background soit visible sur toute la largeur du header, meme au dessus de la scroll bar car celui-ci est
		// ajusté par la suite pour éviter qu'il se décale lors d'un scroll vers la droite
		headerBackGroundView = this.createChildView(SC.View, { 
			layout: { left: 0, right: 0, top: 0, height: headerHeight },
			classNames: 'sc-table-header-background-view', 
		});
			
    headerScrollView = this.createChildView(SC.ScrollView, {
      classNames: 'sc-table-header-scroll-view',
      layout: { left: 0, right: 0, top: 0, height: headerHeight },
      contentView: SC.TableHeaderView.extend({
        layout: { right: 0, minWidth: tableWidth },
        exampleView: SC.TableColumnHeaderView,
        contentBinding: SC.Binding.from('columns', this),
        sortBinding: SC.Binding.from('sort', this),
        tableDelegateBinding: SC.Binding.from('tableDelegate', this).oneWay(),
        ownerTableView: this,
        allowDeselectAll: YES,
        canReorderContentBinding: SC.Binding.from('canReorderColumns', this),
        target: this,
        action: '_onColumnAction',
        actOnSelect: YES,
      }),
			
      hasVerticalScroller: NO, // header never scrolls vertically
      
      // We have to keep a horizontal scroller, but we never want to see it in the header,
      // so make its thickness 0.
      horizontalScrollerView: SC.ScrollerView.extend({
        scrollbarThickness: 0
      }),

      // Bind the horizontal scroll position to the body scroll view's position, so they
      // move in tandem.
      horizontalScrollOffsetBinding: SC.Binding.from('horizontalScrollOffset', bodyScrollView)
    });

    this._headerScrollView = headerScrollView;
    this._headerView = headerScrollView.get('contentView');

    this.set('childViews', [bodyScrollView, headerBackGroundView, headerScrollView]);
  },
  
  /*
    Force a reload of both header and body collection views.
  */
  reload: function() {
    //console.log('%@.reload()'.fmt(this));

    if (this._headerView) {
      this._headerView.reload();
    }
    
    if (this._bodyView) {
      this._bodyView.reload();
    }
  },

  tableColumnDidRequestSort: function(col, colIndex, direction) {
    //console.log('%@.tableColumnDidRequestSort(col: %@, colIndex: %@, direction: %@)'.fmt(this, col, colIndex, direction));
    if (col.get('canSort')) {
      this._sortData = {
        col: col,
        colIndex: colIndex,
        direction: direction
      };
      this.invokeOnce('_sortContent'); // Don't do the sort immediately, so the view will feel more responsive.
    }
  },

  // PRIVATE METHODS
  
  /*
    Try to hand off the sort request to the delegate, otherwise try to do it ourselves.
  */
  
  
  
  _sortContent: function() {
    var del = this.get('tableDelegate');
    var content = this.get('content');
    var dir = this._sortData ? this._sortData.direction : SC.SORT_DIRECTION_NONE;
    var col = this._sortData ? this._sortData.col : null;
    var colIndex = this._sortData ? this._sortData.colIndex : null;
    var didSort = NO, key;
		
		
    //console.log('%@._sortContent()'.fmt(this));
    
    if (del && del.tableDidRequestSort && !del.tableDidRequestSort(this, content, col, colIndex, dir)) {
    	key = col.get('key');
    	
      if (SC.kindOf(content, SC.ArrayController)) {
        if (dir === SC.SORT_DIRECTION_ASCENDING) content.set('orderBy', 'ASC %@'.fmt(key));
        else if (dir === SC.SORT_DIRECTION_DESCENDING) content.set('orderBy', 'DESC %@'.fmt(key));
        else content.set('orderBy', null);
        didSort = YES;
      }
      else if (SC.typeOf(content) === SC.T_ARRAY) {
				content.sortProperty(key);
        if (dir === SC.SORT_DIRECTION_ASCENDING) content.reverse();
        if (content.isEnumerable) content.enumerableContentDidChange();
        didSort = YES;
      }
      else {
        console.warn('Error in TableView(%@)._sortContent(): Content type is not recognized as sortable.'.fmt(this));
      }
      
      // Update the view to show how we're sorting over now.
      if (didSort) {
        this.set('sort', { key: key, direction: dir });
      }
    }
    
    this._sortData = null;
  },

  /*
    If the body view gets or loses a vertical scroll bar, we have to adjust the header
    layout so the scrolling of the two views stays identical.
  */
  _isVerticalScrollerVisibleDidChange: function() {
    this.invokeOnce('_updateTableLayout');
  }.observes('isVerticalScrollerVisible'),

  _tableDelegateDidChange: function() {
    //console.log('%@._tableDelegateDidChange(%@)'.fmt(this, this.get('tableDelegate')));
    this.invokeOnce('reload');
  }.observes('tableDelegate'),

  /*
    Since this is an observer, don't do any actual work, but invalidate the
    appropriate things that should be recalculated next runloop.
  */
  _columnsDidChange: function() {
    //console.log('%@._columnsDidChange()'.fmt(this));
    this.notifyPropertyChange('tableWidth');
    this.invokeOnce('_updateColumnObservers');
    this.invokeOnce('reload');
  }.observes('*columns.[]'),

  _tableWidthDidChange: function() {
    this.invokeOnce('_updateTableLayout');
  }.observes('tableWidth'),
  
  _tv_frameDidChange: function() {
    this.invokeOnce('_updateTableLayout'); // forces scroll bars to update
  }.observes('frame'),
  
  _updateTableLayout: function() {
    var tableWidth = this.get('tableWidth');
    var visibleWidth = this._bodyScrollView.getPath('containerView.frame').width;
    var newWidth = Math.max(tableWidth, visibleWidth);

    //console.log('%@._updateTableLayout(width: %@)'.fmt(this, newWidth));

    this.beginPropertyChanges();
		

    if (this._headerScrollView) {
    	this._headerScrollView.adjust({ right: this._bodyScrollView.get('frame').width - this._bodyScrollView.getPath('containerView.frame').width });
    }
		
		
    if (this._headerView) {
      this._headerView.adjust({ minWidth: newWidth });
    }
    
    if (this._bodyView) {
      this._bodyView.adjust({ minWidth: newWidth });
    }

    this.endPropertyChanges();
  },

  /*
    Add a width observer to each newly-added column; remove from deleted columns.
  */
  _updateColumnObservers: function() {
    //console.log('%@._updateColumnObservers()'.fmt(this));

    var columns = this.get('columns');
    var seen = {}, key;
    
    if (!this._columnIndex) {
      this._columnIndex = {}; // a record of the last known column set
    }
    
    // check the latest column set for anything not present in the last known set.
    if (columns && columns.isEnumerable) {
      columns.forEach(function(col, index) {
        var id = SC.guidFor(col);
        
        if (!this._columnIndex[id]) { // found a new column
          this._columnIndex[id] = col;
          //console.log('...added column %@'.fmt(col.get('name')));
          col.addObserver('width', this, '_columnWidthDidChange');
        }
  
        seen[id] = YES;
      }, this);
    }

    // check the last known column set for anything no longer present in the latest set
    // and clean it up.
    for (key in this._columnIndex) {
      if (this._columnIndex.hasOwnProperty(key) && !seen[key]) {
        //console.log('...removed column %@'.fmt(this._columnIndex[key].get('name')));
        this._columnIndex[key].removeObserver('width', this, '_columnWidthDidChange');
        delete this._columnIndex[key];
      }
    }
  },


  _columnWidthDidChange: function(sender, key, value, context) {
    //console.log('%@._columnWidthDidChange()'.fmt(this));
    this.notifyPropertyChange('tableWidth');
    this.invokeOnce('reload');
  },
  
  /*
    Handles clicks on column headers.
  */
  _onColumnAction: function(sender) {
    var del = this.get('tableDelegate'),
    		selection = sender ? sender.get('selection') : null;
    var col, sort, dir = SC.SORT_DIRECTION_ASCENDING, key;

    if (selection && (selection.get('length') === 1)) {
      col = selection.get('firstObject');
      sort = this.get('sort');
      
      key = col.get('key');

			// first clic sort ASC - second sort DEC - third cancel the sort
      if (sort && (sort.key === key)) {
      	if (sort.direction === SC.SORT_DIRECTION_ASCENDING)  dir = SC.SORT_DIRECTION_DESCENDING;
				else if (sort.direction === SC.SORT_DIRECTION_DESCENDING) {
						// If the content is not from an array controller, we can't cancel the sort
      		 if (SC.kindOf(this.get('content'), SC.ArrayController)) dir = null; 
      		 else dir = SC.SORT_DIRECTION_ASCENDING;
      	}
			}
      
      this.tableColumnDidRequestSort(col, this.get('columns').indexOf(col), dir);
    }

    this._lastColumnSelection = selection;
  },
  
  // PRIVATE PROPERTIES
  
  _headerScrollView: null,
  _headerView: null,
  _bodyScrollView: null,
  _bodyView: null,
  _columnIndex: null,
  _sortData: null,
  _lastColumnSelection: null

});
