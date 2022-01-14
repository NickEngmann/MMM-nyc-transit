/* Magic Mirror
 * Module: MMM-NYC-transit
 *
 * By Elan Trybuch https://github.com/elaniobro
 * MIT Licensed.
 */

Module.register('MMM-nyc-transit', { /*eslint-disable-line*/
    // Default module config.
    defaults: {
        displayType: 'marquee',
        mtaType: 'train',
        stations: [318, 611],
        updateInterval: 180000, // every 3 min
        walkingTime: 0,
    },

    getStyles: function () {
        return ['MMM-nyc-transit.css'];
    },

    start: function () {
        this.getDepartures();
        this.scheduleUpdate();
    },

    getDom: function () {
        var data = this.result; // the data is not ready
        var wrapper = document.createElement('div');
        var marquee = document.createElement('marquee');
        var list = document.createElement('ul');
        var isList = this.config.displayType !== 'marquee';

        wrapper.className = 'MMM-nyc-transit';
        list.className = 'mta__train--list';
        marquee.className = 'mta__train--marquee';

        if (data) {
            var downTown = data[0].downTown;
            var upTown = data[1].upTown;

            if (Object.keys(data).length === 0 && data.constructor === Object) {
                return wrapper;
            }

            if(isList){
                var trainHashMap = {
                    downTown: [],
                    upTown: []
                };

                // Do all the Downtown Mapping First
                downTown.forEach((train) => {
                    if (!trainHashMap.downTown[train.routeId]) {
                        trainHashMap.downTown[train.routeId] = {
                            time: [train.time],
                            dest: train.destination
                        };

                    } else {
                        trainHashMap.downTown[train.routeId].time.push(train.time);
                    }
                });

                var headerTextDowntown = "Manhattan Bound"
                var headerHtmlDowntown = '<span class="mta mta_train mta__train--time mta_train-time__">' + headerTextDowntown + '</span>' /*eslint-disable-line*/;
                var headerListItemDowntown = document.createElement('li');

                headerListItemDowntown.className = 'mta__train--item';
                headerListItemDowntown.innerHTML = headerHtmlDowntown;
                list.appendChild(headerListItemDowntown);
                                
                // clean out the values less then walking time
                var filtered = [];
                for (var dKey in trainHashMap.downTown) {
                    if(dKey == 'A' || dKey == 'C'){
                        filtered = trainHashMap.downTown[dKey].time.slice(0,3).filter(function(value, index, arr){ return value > 10;})
                    }
                    else {
                        filtered = trainHashMap.downTown[dKey].time.slice(0,3).filter(function(value, index, arr){ return value > 9;})
                    }
                    trainHashMap.downTown[dKey].time = filtered;
                }

                var trainHashMapSortedDowntown = [{
                    time: [],
                    dest: "",
                    name: ""
                }];
                var j = 0;

                // change time objects to dates and create time sorted array
                for (var dKey in trainHashMap.downTown) {
                    var oldDateObj = new Date();
                    var timeArray = [];

                    for (var trainTime in trainHashMap.downTown[dKey].time){
                        var newDateObj = new Date(oldDateObj.getTime() + trainHashMap.downTown[dKey].time[trainTime]*60000);
                        timeArray.push(newDateObj);
                    }
                    trainHashMapSortedDowntown[j] = {
                        time: timeArray,
                        dest: trainHashMap.downTown[dKey].dest,
                        name: dKey
                    };
                    j += 1;
                };
                //sort by time
                trainHashMapSortedDowntown.sort((a,b) => a.time[0] - b.time[0]);

                var mta_train_index = 0;
                for (var dKey in trainHashMapSortedDowntown) {
                    var dHtml = '';
                    var downTownListItem = document.createElement('li');

                    dHtml = dHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + trainHashMapSortedDowntown[dKey].name.toLowerCase() + '">' + trainHashMapSortedDowntown[dKey].name + '</span>' + trainHashMapSortedDowntown[dKey].dest + '<span class="mta mta_train mta__train--time mta_train-time__' + trainHashMapSortedDowntown[dKey].name.toLowerCase() + '"> ' + trainHashMapSortedDowntown[dKey].time.map((trainTime) => ' ' + trainTime.toLocaleTimeString('en-US',{hour: 'numeric', minute:'numeric'}) + '') + ' </span>'; /*eslint-disable-line*/
                    
                    if(mta_train_index == 0){
                        downTownListItem.className = 'mta__train--main';
                    }
                    else{
                        downTownListItem.className = 'mta__train--item';
                    }

                    downTownListItem.innerHTML = dHtml;
                    mta_train_index++;
                    list.appendChild(downTownListItem);
                }

                upTown.forEach((train) => {
                    if (!trainHashMap.upTown[train.routeId]) {
                        trainHashMap.upTown[train.routeId] = {
                            time: [train.time],
                            dest: train.destination
                        };

                    } else {
                        trainHashMap.upTown[train.routeId].time.push(train.time);
                    }
                });

                var headerTextUpTown = "Surf + Garage Bound"
                var headerHtmlUpTown = '<span class="mta mta_train mta__train--time mta_train-time__">' + headerTextUpTown + '</span>' /*eslint-disable-line*/;
                var headerListItemUpTown = document.createElement('li');

                headerListItemUpTown.className = 'mta__train--item';
                headerListItemUpTown.innerHTML = headerHtmlUpTown;
                list.appendChild(headerListItemUpTown);
                
                // clean out the values less then walking time
                var filtered = [];
                for (var uKey in trainHashMap.upTown) {
                    if(uKey == 'A' || uKey == 'C'){
                        filtered = trainHashMap.upTown[uKey].time.slice(0,3).filter(function(value, index, arr){ return value > 10;})
                    }
                    else {
                        filtered = trainHashMap.upTown[uKey].time.slice(0,3).filter(function(value, index, arr){ return value > 9;})
                    }
                    trainHashMap.upTown[uKey].time = filtered;
                }

                var trainHashMapSortedUpTown = [{
                    time: [],
                    dest: "",
                    name: ""
                }];
                var j = 0;

                // change time objects to dates and create time sorted array
                for (var uKey in trainHashMap.upTown) {
                    var oldDateObj = new Date();
                    var timeArray = [];

                    for (var trainTime in trainHashMap.upTown[uKey].time){
                        var newDateObj = new Date(oldDateObj.getTime() + trainHashMap.upTown[uKey].time[trainTime]*60000);
                        timeArray.push(newDateObj);
                    }
                    trainHashMapSortedUpTown[j] = {
                        time: timeArray,
                        dest: trainHashMap.upTown[uKey].dest,
                        name: uKey
                    };
                    j += 1;
                };
                //sort by time
                trainHashMapSortedUpTown.sort((a,b) => a.time[0] - b.time[0]);

                var mta_train_index = 0;
                for (var uKey in trainHashMapSortedUpTown) {
                    var uHtml = '';
                    var upTownListItem = document.createElement('li');

                    uHtml = uHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + trainHashMapSortedUpTown[uKey].name.toLowerCase() + '">' + trainHashMapSortedUpTown[uKey].name + '</span>' + trainHashMapSortedUpTown[uKey].dest + '<span class="mta mta_train mta__train--time mta_train-time__' + trainHashMapSortedUpTown[uKey].name.toLowerCase() + '"> ' + trainHashMapSortedUpTown[uKey].time.map((trainTime) => ' ' + trainTime.toLocaleTimeString('en-US',{hour: 'numeric', minute:'numeric'}) + '') + ' </span>'; /*eslint-disable-line*/
                    
                    if(mta_train_index == 0){
                        upTownListItem.className = 'mta__train--main';
                    }
                    else{
                        upTownListItem.className = 'mta__train--item';
                    }

                    upTownListItem.innerHTML = uHtml;
                    mta_train_index++;
                    list.appendChild(upTownListItem);

                }

                wrapper.appendChild(list);


                return wrapper;
            } else {

                for (var upMarKey in upTown) {

                    if (!Object.prototype.hasOwnProperty.call(upTown, upMarKey)) { continue; }

                    var upMarHtml = '';
                    var upTownMarListItem = document.createElement('span');

                    upMarHtml = upMarHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + upTown[upMarKey].routeId.toLowerCase() + '">' + upTown[upMarKey].routeId.toLowerCase() + '</span><span class="mta mta_train mta__train--time mta_train-time__' + (parseFloat(upMarKey) + 4) + '">' + upTown[upMarKey].time + 'min</span> | <span class="mta mta_train mta__train--destination">' + upTown[upMarKey].destination + '</span>'; /*eslint-disable-line*/

                    upTownMarListItem.className = 'mta__train--item';
                    upTownMarListItem.innerHTML = upMarHtml;
                    marquee.appendChild(upTownMarListItem);
                }

                for (var downMarKey in downTown) {

                    if (!Object.prototype.hasOwnProperty.call(downTown, downMarKey)) { continue; }
                    var downMarHtml = '';
                    var downTownMarListItem = document.createElement('span');

                    downMarHtml = downMarHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + downTown[downMarKey].routeId.toLowerCase() + '">' + downTown[downMarKey].routeId.toLowerCase() + '</span><span class="mta mta_train mta__train--time mta_train-time__' + (parseFloat(downMarKey) + 4) + '">' + downTown[downMarKey].time + 'min</span> | <span class="mta mta_train mta__train--destination">' + downTown[downMarKey].destination + '</span>'; /*eslint-disable-line*/

                    downTownMarListItem.className = 'mta__train--item';
                    downTownMarListItem.innerHTML = downMarHtml;
                    marquee.appendChild(downTownMarListItem);
                }

                wrapper.appendChild(marquee);

                return wrapper;
            }
        }

        return wrapper;
    },

     compareValues: function(key, order = 'asc') {
        return function innerSort(a, b) {
          if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
            // property doesn't exist on either object
            return 0;
          }
      
          const varA = (typeof a[key] === 'string')
            ? a[key].toUpperCase() : a[key];
          const varB = (typeof b[key] === 'string')
            ? b[key].toUpperCase() : b[key];
      
          let comparison = 0;
          if (varA > varB) {
            comparison = 1;
          } else if (varA < varB) {
            comparison = -1;
          }
          return (
            (order === 'desc') ? (comparison * -1) : comparison
          );
        };
    },

    getDepartures: function() {
        var config = this.config;

        this.sendSocketNotification('GET_DEPARTURES', config);
    },

    scheduleUpdate: function (delay) {
        var loadTime = this.config.updateInterval;
        var that = this;

        if (typeof delay !== 'undefined' && delay >= 0) {
            loadTime = delay;
        }

        setInterval(function () {
            that.getDepartures();
        }, loadTime);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'TRAIN_TABLE') {
            console.log('socketNotificationReceived: "TRAIN_TABLE": ', this.result); /*eslint-disable-line*/

            this.result = payload;
            this.updateDom(self.config.fadeSpeed);
        }
    }
});