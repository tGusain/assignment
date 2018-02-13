'use strict';
const haversine = require('haversine');
const utils = {
  /*
     utility function to get the distance between two points
  */
  getDistance: (source, destination) => {
        const start = {
            latitude: source.split(",")[0],
            longitude: source.split(",")[1]
        }

        const end = {
            latitude: destination.split(",")[0],
            longitude: destination.split(",")[1]
        }
        return haversine(start, end);
    },

    /*
      utility function to get the distance between two points
    */
    getTime: (timeStamp) => {
        return new Date().getTime() - timeStamp;
    }

};

module.exports = utils;

