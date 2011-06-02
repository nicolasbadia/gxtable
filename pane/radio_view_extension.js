// ==========================================================================
// Project:   SC - JavaScript Framework
// Copyright: ©2011 Badia Nicolas and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// I've add multiple selection support to the radioView
SC.RadioView.reopen({
	
	allowsMultipleSelection: NO,
	
  mouseUp: function(evt) {
    if (!this.get('isEnabled')) return YES;

    var delegate = this.get('renderDelegate'), proxy = this.get('renderDelegateProxy'),
        displayItems = this.get('displayItems'),
    		index = delegate.indexForEvent(proxy, this.$(), evt),
				value = this.get('value');
    
		if (this.get('allowsMultipleSelection')) {

			if (this._activeRadioButton !== undefined) {
				if (index === this._activeRadioButton && inArray(displayItems[index].value, value)) {
					displayItems[index].set('isActive', NO);
					value.removeAt(value.indexOf(displayItems[index].value));
				}
				else {
					displayItems[index].set('isActive', YES);
					value.push(displayItems[index].value);
				}
				
				this.notifyPropertyChange('value');
				this._activeRadioButton = undefined;
				delegate.updateRadioAtIndex(proxy, this.$(), index);
			}
		}
    else {
			if (this._activeRadioButton !== undefined && index !== this._activeRadioButton) {
	      displayItems[this._activeRadioButton].set('isActive', NO);
	      delegate.updateRadioAtIndex(proxy, this.$(), this._activeRadioButton);
	    }
    	
			this._activeRadioButton = undefined;
			
	    if (index !== undefined) {
	      displayItems[index].set('isActive', NO);
	      this.set('value', displayItems[index].value);
				delegate.updateRadioAtIndex(proxy, this.$(), index);
	    }
		}
  },
	
	
	
});