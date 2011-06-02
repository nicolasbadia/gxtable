// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*
	GX.TableUsersDefaultMixin need to be add to your arrayController


*/


GX.TableUsersDefaultMixin = {
	
	UsersDefaultMixinIsInit: NO,
	
  /*
		List of all the columns that can be displayed
		
		columnsList: [	
			SC.TableColumn.create({ key: "dateF", label: "Date", width: 80, sort: 'date' }),
			SC.TableColumn.create({ key: "prefixNumero", label: "Number", width: 70, sort: 'guid' }),
			SC.TableColumn.create({ key: "member.infosList", label: "Member", width: 150, sort: "_member" }),
			SC.TableColumn.create({ key: "memberName", label: "Real Membre Name", width: 120, }),
			SC.TableColumn.create({ key: "name", label: "Name", width: 150, sortServer: '_name' }),
		]
		
	*/
	columnsList: [], 
	
	/*
		Default list of the columns to display
		
		["Date", "Number", "Member", "Name"]
	*/
	columnsDefault: [],
	
	/*
		Array with the selected column in the radioView (same as columnsDefault)
		@read-only
		
		["Date", "Number", "Member", "Name"]
	*/
	radioColumnItems: [],
	
	
	/*
		Array saved in the local storage
		@read-only
		
		[{ label: 'date', width: '10' }, ...]
	*/
	columnsProperties: [],
	

  /*
    Array of column objects (each should mix in SC.Column).  May be bound
    to an array controller if desired.
		@read-only
  */
  columns: [],
	
	
	initUsersDefaultMixin: function() {
		if (!this.get('UsersDefaultMixinIsInit')) {
			
			var columnsProperties = this.getUserDefaults('columnsProperties');
			if (columnsProperties) {
				this.set('columnsProperties', columnsProperties);
			}
			// If it's the firstime we show the tableView we set columnsProperties
			else {
				var columnsList = this.get('columnsList'),
						columnsDefault = this.get('columnsDefault');
				columnsProperties = [];
				
				columnsList.forEach(function(col){  
					if (inArray(col.get('label'), columnsDefault)) {
						columnsProperties.push({ label: col.label, width: col.width });
					}	
				});
				this.set('columnsProperties', columnsProperties);
				this.setUserDefaults('columnsProperties'); // we saved columnsProperties
			}
			this.set('UsersDefaultMixinIsInit', YES);
			
			this.createRadioColumnItems();
			this.updateColumns();
		}
	},


	// Création the columns to be used with the tableView from the saved columnsProperties
	updateColumns: function() {
		var	columns = [],
				columnsList = this.get('columnsList'),
				columnsProperties = this.get('columnsProperties'),
				column;
				
		columnsProperties.forEach(function(col){  
			column = columnsList.findProperty('label', col.label);
			column.width = col.width;
			columns.pushObject(column);
		});
		
		this.set('columns', columns);
  },
	
	// Générate the radioColumnItems used by the radioView
	createRadioColumnItems: function() {
		var radioColumnItems = [],
				columnsProperties = this.get('columnsProperties');
		
		columnsProperties.forEach(function(col){  
			radioColumnItems.push(col.label);
		});
		
		this.set('radioColumnItems', radioColumnItems);
	},

	// Get the width and the order from the tableView and save it
	updateColumnsProperties: function() {
		var	columnsProperties = [],
				columns = this.getPath('TABLE_VIEW.columns'); 
				
		columns.forEach(function(col){ columnsProperties.push({ label: col.label, width: col.width }); });
		
		this.set('columnsProperties', columnsProperties);
		this.setUserDefaults('columnsProperties');
  },	
	
	
	// Show the radioView menu
	openReglageColonne: function(view) {
		var pane = GX.TableRadioView.create({ target: this, });
    pane.popup(view, SC.PICKER_POINTER, [3,0,1,2,2]);
  },
	
	// Call when you change the radioView selection
	tableListColumnDidChange: function() {
		var radioColumnItems = this.get('radioColumnItems'),
				columnsList = this.get('columnsList'), columnList,
				columnsProperties = this.get('columnsProperties'), columnProperties;
		
		// Si on a ajouter une colonne
		if (radioColumnItems.get('length') > columnsProperties.get('length')) {
			radioColumnItems.forEach(function(col){  
				columnProperties = columnsProperties.findProperty('label', col);
				columnList = columnsList.findProperty('label', col);

				if (!columnProperties) {
					columnsProperties.insertAt(columnsList.indexOf(columnList), { label: col, width: columnList.width });
				}
			});
		}
		else if (radioColumnItems.get('length') < columnsProperties.get('length')){
			columnsProperties.forEach(function(col){  
				if (!inArray(col.label, radioColumnItems)) columnsProperties.removeObject(col);
			});
		}
		
		this.set('columnsProperties', columnsProperties);
		this.setUserDefaults('columnsProperties');
		this.updateColumns();
  },
	
	
	setUserDefaults: function(key) {
		var value = this.get(key);
		SC.userDefaults.set([this.NAME,key].join(':'), value);
	},
	getUserDefaults: function(key) {
		return SC.userDefaults.get([this.NAME,key].join(':'));
	},
	
};