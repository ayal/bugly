theobjects = new Meteor.Collection("theobjects");

Meteor.methods({
  saveAlbum: function(obj) {
    if (this.is_simulation) {
      return null;
    }
    
    console.log('saving..', obj);
    var already = theobjects.findOne({key: obj.key});
    if (!already) {
      console.log('saving new obj');
      theobjects.insert(obj);
    }
    else {
      console.log('updating obj with', already._id, obj);
      theobjects.update({_id: already._id}, obj);
    }
    return 'okay';
  }
});


if (Meteor.isClient) {

  Meteor.startup(function () {
    Meteor.subscribe("objsub", function () {
  
    });
  });

  Template.arr.all = function () {
    var theone = theobjects.findOne({key: 'thekey'});
    if (!theone) {
      return [];
    }
    return theone.arr;
  };


  Template.arr.events = {
    'click .arr': function(e) {
      console.log('this', this);
      var theone = theobjects.findOne({key: 'thekey'});
      var that = this;
      theone.arr = $.map(theone.arr, function(v){
        if (v.val === that.val) {
          that.val++;
          return that;
        }
        return v;
      });

      console.log('this', this);
      
      Meteor.call('saveAlbum', theone,
		  function(e, curs) {		
		    console.log('saved', arguments);
		  });
    }
  };
}

if (Meteor.isServer) {
  
  theobjects.remove({});
  theobjects.insert({key: 'thekey', arr: [{val: 10}]});

  Meteor.startup(function () {
    Meteor.publish("objsub", function () {
      return theobjects.find({});
    });
    
    // code to run on server at startup
  });
}
