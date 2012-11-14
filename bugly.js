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

  window.equals = function(tis, x) {
    var p;
    for(p in tis) {
      if(typeof(x[p])=='undefined') {
	return false;}
    }

    for(p in tis) {
      if (tis[p]) {
	
	switch(typeof(tis[p])) {
	  
	 case 'object':
          if (!tis[p].equals(x[p])) {
	    return false; } break;
	 case 'function':
          if (typeof(x[p])=='undefined' ||
	      (p != 'equals' && tis[p].toString() != x[p].toString()))
	    return false;
          break;
	default:
          if (tis[p] != x[p]) { return false; }
	}
      } else {
	if (x[p])
	  return false;
      }
    }

    for(p in x) {
      if(typeof(tis[p])=='undefined') {return false;}
    }

    return true;
  };


  Meteor.startup(function () {
    Meteor.subscribe("objsub", function () {
  
    });
  });

  Template.marks.marks = function () {
    var theone = theobjects.findOne({key: 'thekey'});
    if (!theone) {
      return [];
    }
    return theone.marks.sort(function(a,b){return a.start - b.start;});
  };

  Template.marks.events = {
    'click span.badge-success': function(e) {
      var theone = theobjects.findOne({key: 'thekey'});
      var that = this;

      theone.marks = $.map(theone.marks, function(m){
        console.log('comparing - this = ',
                    JSON.stringify(that), 
                    ', mark from db = ', 
                    JSON.stringify(m));

	if (window.equals(m, that)) {
          that.start = (e.ctrlKey ? parseFloat(that.start)-0.25 : parseFloat(that.start)+0.25);
	  return that;
	}
	return m;
      });

      Meteor.call('saveAlbum', theone,
		  function(e, curs) {		
		    console.log('saved', arguments);
		  });
    }
  };
}

if (Meteor.isServer) {

  theobjects.remove({});
  theobjects.insert({key: 'thekey', marks: [{"start":0,"end":1.6,"text":"...","display":"inline","language":"en"},{"start":1.6,"end":3.4,"text":"...Sleeping late, I","display":"inline","language":"en"},{"start":3.4,"end":6.2,"text":"...\n","display":"inline","language":"en"},{"start":6.2,"end":7.8,"text":"...Hear the sad horns of labor trucks sigh","display":"inline","language":"en"},{"start":7.8,"end":9.6,"text":"...\n","display":"inline","language":"en"},{"start":9.6,"end":11.8,"text":"...My neighbor walks by","display":"inline","language":"en"},{"start":15.8,"end":15.1,"text":"...\n","display":"inline","language":"en"},{"start":15.6,"end":19.3,"text":"...High heels click dry","display":"inline","language":"en"}]});

  Meteor.startup(function () {
    Meteor.publish("objsub", function () {
      return theobjects.find({});
    });
    
    // code to run on server at startup
  });
}
