// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and Jonathan Lewis and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals SC*/

/*
  Mixin that defines the Column object API.  Mix this into any object
  that will be used as a column in the TableView's 'columns' property.
*/

SC.Column = {

  // PUBLIC PROPERTIES
  
  isColumn: YES,
  
  /*
    The name of the column -- will be shown in this column's header view.
  */
  label: null,

  /*
    The name of the property on your row objects whose value should be
    shown in this column.
  */
  key: null,

	/*
    The key to use to sort this column if the key is a path
  */
  sort: null,

	/*
    The key to use to sort this column using the server.
  */
  sortServer: null,

  /*
    @optional
    The name of the property on your row objects whose value will provide an
    icon classname string for this column.  If null, will be ignored and no icon class
    will be added.
    
    If this property is non-null, then an additional icon div will be automatically pushed
    inside the cell's outer div with the CSS classes 'icon' and whatever other classname string
    the property referenced by 'iconKey' provides.  In addition, to help with styling, 
    the 'has-icon' class will also be added to the cell's outer div.
  */
  iconKey: null,

  /*
    The width of the column in pixels.  You can set this property at any
    time to manually resize the column.  This property will be updated whenever
    someone drags to resize the column in the table view as well.
  */
  width: 100,

  /*
    Set to NO to disallow resizing this column via dragging in the table view.
    However, manually setting the 'width' property above will always work, regardless
    of the setting here.
  */
  canResize: YES,
  
  /*
    Whether or not this column can request to be sorted in response to a click on its header
    view in the table.  If YES, then the SC.TableDelegate object will get the first
    option to handle the sort request, and if it declines or doesn't exist, then the
    TableView itself will attempt to sort the column.  Be sure to pay attention to how many
    rows you're trying to sort, as this can take quite some time for large tables and raise
    "unresponsive script" errors in the browser.
  */
  canSort: YES,
  
  /*
    An array of additional CSS class names you would like to apply to this column's
    header view, if desired.
  */
  classNames: null,
    rightClicOnColumnHeader: function(evt) {
			console.log("Message");
	  },
};
