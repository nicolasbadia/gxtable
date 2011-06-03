#Overview


I share the table view I'm using for my project. 

From the work of [__jslewis__](https://github.com/jslewis/sctable)
Thanks a lot to him !


Not sure this tableView will work like this for you, you may have to made some changes to make it fit your needs. 
I have try to bring all the dependant files (and function) into the repository but I may have forget somes. If so, let me know.
I have try to made it as simple as possible to be easy to extend.

I've also extended the radioView to allow multiple selection (see pane/radio_view_extension)

No demo yet (see the screenshot), I will keep you informed when my app is ready.



Design Goals:

  * Use the existing Sproutcore API -- no modifications to Sproutcore are necessary.
  * Be intuitive and responsive from a user's perspective.  (Includes rendering quickly, so the row view rendering is kept intentionally simple.)
  * Be easy to plug in from a developer's perspective.


Cool features:

  * Sort the columns and use a delegate for this
  * Reorder, resize and save the changes with SC.UsersDefault (local storage)
  * Hide/show columns with a PickerPane (and a radioView) and also save this choice


#How to Use

The main view provided by this project is SC.TableView (in views/table.js).

* __Row content__: Bind an array or ArrayController full of your row objects to the 'content' property.
* __Row Selection__: The 'selection' property gives you an SC.SelectionSet of selected rows.
* __Column Definitions__: Bind an array of column descriptor objects (SC.TableColumn) to the 'columns' property.  The order of these objects determines the order the columns are shown in the table.

The table view header subclasses SC.CollectionView, and the table body subclasses SC.ListView, so both your content and columns array controllers can have full collection view delegate power if you wish to implement it.




#Exemple


# ArrayController

	// GX.TableUsersDefaultMixin need to be add to your arrayController
	GX.myController = SC.ArrayController.create(GX.TableUsersDefaultMixin, {

		NAME: 'myController',

		columnsList: [	
			SC.TableColumn.create({ key: "dateF", label: "Date", width: 80, sort: 'date' }),
			SC.TableColumn.create({ key: "number", label: "Number", width: 70, sort: 'guid' }),
			SC.TableColumn.create({ key: "member.infosList", label: "Member", width: 150, sort: "_member" }),
			SC.TableColumn.create({ key: "memberName", label: "Real Membre Name", width: 120, }),
			SC.TableColumn.create({ key: "name", label: "Name", width: 150, sortServer: '_name' }),
		],
		columnsDefault: ["Date", "Number", "Member", "Name"],

	
		init: function() {
			sc_super();
			this.invokeLast('initUsersDefaultMixin');
		},

	});



# View


	GX.TableView = SC.TableView.design({  
		contentBinding: 'GX.myController.arrangedObjects',
		selectionBinding: 'GX.myController.selection',  
		columnsBinding: 'GX.myController.columns',
	
	  headerHeight:22,
	  rowHeight:20,
	  canReorderContent: NO,
	  allowDeselectAll: NO,
	  canDeleteContent: YES,
		showAlternatingRows: YES,
		delegate: SC.TableDelegate,
		exampleView: SC.TableRowView,
	

	});


# Utilies
	
You can use this function to make it work :

	String.prototype.hasVal = function(value) {
		return this.indexOf(value) !== -1;
	};


	function inArray(object, array) {
		if (array.get('length')===0) return false;
	 	return (jQuery.inArray(object, array) !== -1);
	}


	// To disable the native context menu
	document.oncontextmenu = new Function("return false");




#Dependencies

  * [__Sproutcore__](http://www.github.com/sproutcore/sproutcore) (versions 1.4-stable through 1.5.0.pre.4)
