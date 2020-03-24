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
        updateInterval: 300000, // every 5 min
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
                var headerText = "Manhattan Bound"
                var headerHtml = '<span class="mta mta_train mta__train--time mta_train-time__">' + headerText + '</span>' /*eslint-disable-line*/;
                var headerListItem = document.createElement('li');

                headerListItem.className = 'mta__train--item';
                headerListItem.innerHTML = headerHtml;
                list.appendChild(headerListItem);
                                
                // clean out the values less then walking time
                var filtered = [];
                for (var dKey in trainHashMap.downTown) {
                    if(dKey == 'A' || dKey == 'C'){
                        filtered = trainHashMap.downTown[dKey].time.slice(0,3).filter(function(value, index, arr){ return value > 13;})
                    }
                    else {
                        filtered = trainHashMap.downTown[dKey].time.slice(0,3).filter(function(value, index, arr){ return value > 9;})
                    }
                    trainHashMap.downTown[dKey].time = filtered;
                }

                var trainHashMapSorted = [{
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
                        // timeArray.push(newDateObj.toLocaleTimeString('en-US',{hour: 'numeric', minute:'numeric'}));
                        timeArray.push(newDateObj);
                    }
                    trainHashMapSorted[j] = {
                        time: timeArray,
                        dest: trainHashMap.downTown[dKey].dest,
                        name: dKey
                    };
                    j += 1;
                };
                //sort by time
                trainHashMapSorted.sort((a,b) => a.time[0] - b.time[0]);

                var mta_train_index = 0;
                for (var dKey in trainHashMapSorted) {
                    var dHtml = '';
                    var downTownListItem = document.createElement('li');

                    dHtml = dHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + trainHashMapSorted[dKey].name.toLowerCase() + '">' + trainHashMapSorted[dKey].name + '</span>' + trainHashMapSorted[dKey].dest + '<span class="mta mta_train mta__train--time mta_train-time__' + trainHashMapSorted[dKey].name.toLowerCase() + '"> ' + trainHashMapSorted[dKey].time.map((trainTime) => ' ' + trainTime.toLocaleTimeString('en-US',{hour: 'numeric', minute:'numeric'}) + '') + ' </span>'; /*eslint-disable-line*/
                    
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

                for (var uKey in trainHashMap.upTown) {
                    var uHtml = '';
                    var upTownListItem = document.createElement('li');
                    var oldDateObj = new Date();

                    var timeArray = [];
                    for (var trainTime in trainHashMap.upTown[uKey].time.slice(0,3)){
                        var newDateObj = new Date(oldDateObj.getTime() + trainHashMap.upTown[uKey].time[trainTime]*60000);
                        timeArray.push(newDateObj.toLocaleTimeString('en-US',{hour: 'numeric', minute:'numeric'}));
                    }
                    // uHtml = uHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + uKey.toLowerCase() + '">' + uKey + '</span>' + trainHashMap.upTown[uKey].dest + '<span class="mta mta_train mta__train--time mta_train-time__' + uKey.toLowerCase() + '"> ' + timeArray.slice(0,3).map((trainTime) => ' ' + trainTime + '') + '</span>'; /*eslint-disable-line*/

                    upTownListItem.className = 'mta__train--item';
                    upTownListItem.innerHTML = uHtml;

                    list.appendChild(upTownListItem);
                }

                wrapper.appendChild(list);

                return wrapper;
            } else{

                for (var upMarKey in upTown) {

                    if (!Object.prototype.hasOwnProperty.call(upTown, upMarKey)) { continue; }

                    var upMarHtml = '';
                    var upTownMarListItem = document.createElement('span');

                    // upMarHtml = upMarHtml + '<span class="mta mta__train mta__train--logo mta__train--line-' + upTown[upMarKey].routeId.toLowerCase() + '">' + upTown[upMarKey].routeId.toLowerCase() + '</span><span class="mta mta_train mta__train--time mta_train-time__' + upMarKey + '">' + upTown[upMarKey].time + 'min</span> | <span class="mta mta_train mta__train--destination">' + upTown[upMarKey].destination + '</span>'; /*eslint-disable-line*/

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
