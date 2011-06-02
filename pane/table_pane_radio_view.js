// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// 

sc_require('radio_view_extension');



GX.TableRadioView = SC.PickerPane.extend({
	target: null, // An arrayController
	
	themeName: 'popover',
	
	radioView: null,
	
  layout: { width: 200, height: 250 },
	
	contentView: SC.WorkspaceView.design({
		topToolbar: null,
	  contentView: SC.View.extend({
			classNames: ['background-grey'],
			
			render: function() {
				this.removeAllChildren();
				
				var target = this.getPath('parentView.parentView.target');

				this.appendChild(SC.LabelView.create({
					layout: { top: 10, height: 18, width: 250, left: 20 },
					value: 'Display columns :',
				}));
			
		    var reglageBtRadio = GX.RadioView.create({
			  	layout: {top: 40, bottom: 0, left: 35, right: 0 },
					allowsMultipleSelection: YES,
			  	items: target.get('columnsList'),
					itemTitleKey: 'label',
			    itemValueKey: 'label',
					valueBinding: 'GX.myController.radioColumnItems',
					valueDidChange: function() { 
						target.tableListColumnDidChange(); 
					}.observes('value'),
			  });
				this.appendChild(reglageBtRadio);
				
				height = target.getPath('columnsList.length')*20;
				this.getPath('parentView.parentView').adjust('height', height+40+30);
			},    
		}),
	}),
	
});



