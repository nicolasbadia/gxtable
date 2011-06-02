// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC*/


/*
  Extends SC.CollectionView to render the table's header.
*/

SC.TableHeaderView = SC.CollectionView.extend({

  // PUBLIC PROPERTIES

  classNames: 'sc-table-header-view',

  /*
    Mirrors the SC.TableView.sort property.  See table.js for documentation.
  */
  sort: null,

  /*
    Pointer to the TableView that owns this header.
  */
  ownerTableView: null,

  ghostActsLikeCursor: YES,



  /*
    View class definition for showing the insertion point for reorder dragging.
  */
  insertionPointView: SC.View.extend({
    backgroundColor: '#57647F',
    layout: { left: 0, top: 0, bottom: 0, width: 2 },
    render: function(context, firstTime) {
      if (firstTime) {
        context.push('<div class=\"anchor\"></div>');
      }
    }
  }),

  // PUBLIC METHODS

  layoutForContentIndex: function(contentIndex) {
    var content = this.get('content');
    var left = 0, width, ret;
    
    // TODO: Set up an internal lookup table of some sort to avoid the brute force looping search here.
    if (content && content.isEnumerable) {
      content.forEach(function(col, index) {
        if (index < contentIndex) {
          left += col.get('width');
        }
        else if (index === contentIndex) {
          width = col.get('width');
        }
      });
      
      ret = {
        left: left,
        width: width
      };
    }

    return ret;
  },

  /*
    Overriding from SC.CollectionView to apply sort info to each item view prior
    to creation.
  */
  createItemView: function(exampleClass, idx, attrs) {
    var sort = this.get('sort');
    var key = sort ? sort.key : null;
        
    if (attrs.content && (attrs.content.get('key') === key)) {
      attrs.sortDirection = sort ? sort.direction : null;
    }
    else {
      delete attrs.sortDirection; // attrs is reused, so clean it up
    }

    return exampleClass.create(attrs);
  },

	
	invokeDelegateMethod: function(methodName) {
		var delegate = this.get('tableDelegate'),
				method = delegate[methodName],
    		args = SC.A(arguments); args = args.slice(1, args.length)
				content = this.getPath('parentView.parentView.parentView.content');
			
		args.unshift(content);
    return method.apply(delegate, args);
  },



  collectionViewDragViewFor: function(view, dragContent) {
    var itemView;
		 dragContent.forEach(function(i) { itemView = this.itemViewForContentIndex(i); }, this);
	
		if (itemView) {
			return SC.LabelView.create({ 
						layout: { width: itemView.layout.width, height: 22 }, 
						classNames: 'sc-table-header-ghost', 
						value: itemView.getPath('content.label'),
					}); 
    }
  },

  insertionIndexForLocation: function(loc, dropOperation) { 
    var childViews = this.get('childViews');
    var i, frame;
    var ret = -1;
    
    if (childViews) {
      // TODO: Set up an internal lookup table of some sort to avoid the brute force looping search here.
      for (i = 0; i < childViews.length; i++) {
        frame = childViews[i].get('frame');
        
        if ((loc.x >= frame.x) && (loc.x <= (frame.x + frame.width))) {
          ret = [i, SC.DROP_AFTER];
          if ((loc.x - frame.x) < ((frame.x + frame.width) - loc.x)) ret[1] = SC.DROP_BEFORE;
          break;
        }
      }
    }

    return ret;
  },
  
  showInsertionPoint: function(itemView, dropOperation) {
    var view = this._insertionPointView;
    var frame = itemView.get('frame');
    var left = frame.x;
    
    if (!view) view = this._insertionPointView = this.get('insertionPointView').create();
    
    if (dropOperation & SC.DROP_AFTER) {
      if (itemView.get('contentIndex') === (this.get('length') - 1)) left = frame.x + frame.width - view.get('frame').width;
      else left = frame.x + frame.width;
    }
    
    view.adjust({ left: left });
    this.appendChild(view);
  },
  
  hideInsertionPoint: function() {
    if (this._insertionPointView) this._insertionPointView.removeFromParent().destroy();
    this._insertionPointView = null;

		this.invokeDelegateMethod('endColumnDrag');
  },

	
  
  // PRIVATE METHODS
  
  _sortDidChange: function() {
    //console.log('%@._sortDidChange(%@)'.fmt(this, this.get('sort')));
    this.invokeOnce('_updateSortView');
  }.observes('sort'),
  
  _updateSortView: function() {
    var childViews = this.get('childViews'), i, col;
    var sort = this.get('sort');
    var key = sort ? sort.key : null;
    var dir = sort ? sort.direction : null;
    
    //console.log('%@._updateSortView()'.fmt(this));

    if (childViews) {
      for (i = 0; i < childViews.length; i++) {
        col = childViews[i].get('content');
        
        if (col) {
          if (col.get('key') === key) childViews[i].set('sortDirection', dir);
          else childViews[i].set('sortDirection', null);
        }
      }
    }
  },
  
  
  // PRIVATE PROPERTIES
  
  _insertionPointView: null

});
