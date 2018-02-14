'use strict';

const fp = require('lodash/fp');
const _ = require('lodash');
const util = require('./util');

/* Algorithms */
const algorithms = {


    firstMile: ({
        LEFTOVER,
        FIRSTMILE_THRESHOLD
    }) => ({
        orders,
        deliveryExecutives
    }) => {
        _.forEach(orders, (order) => {
            let deliveryExecutiveMinIndex;
            let minDistance = 100000;
            if (order.assigned) return;
            _.forEach(deliveryExecutives, (deliveryExecutive, deliveryExecutiveIndex) => {
                let distance = util.getDistance(order.resturant_location, deliveryExecutive.current_location);
                if (!deliveryExecutive.assigned &&
                    (LEFTOVER || distance <= FIRSTMILE_THRESHOLD) &&
                    minDistance > distance) {
                    deliveryExecutiveMinIndex = deliveryExecutiveIndex;
                    minDistance = distance;
                }
            });
            if (deliveryExecutiveMinIndex != undefined) {
                order.assigned = true;
                order.assingedDE = deliveryExecutives[deliveryExecutiveMinIndex].id;
                deliveryExecutives[deliveryExecutiveMinIndex].assigned = true;
                deliveryExecutives[deliveryExecutiveMinIndex].assignedOrder = order.id;
            }
        });
        return {
            orders,
            deliveryExecutives
        };
    },

    waitingTime: ({
        LEFTOVER,
        WAITINGTIME_THRESHOLD
    }) => ({
        orders,
        deliveryExecutives
    }) => {
        _.forEach(orders, function(order) {
            let deliveryExecutiveMinIndex;
            let maxWaitingTime = 0;
            if (order.assigned) return;
            _.forEach(deliveryExecutives, (deliveryExecutive, deliveryExecutiveIndex) => {
                let waitingTime = util.getTime(deliveryExecutive.last_order_delivered_time);
                if (!deliveryExecutive.assigned &&
                    (LEFTOVER || waitingTime >= WAITINGTIME_THRESHOLD) &&
                    maxWaitingTime < waitingTime) {
                    deliveryExecutiveMinIndex = deliveryExecutiveIndex;
                    maxWaitingTime = waitingTime;
                }
            });
            if (deliveryExecutiveMinIndex != undefined) {
                order.assigned = true;
                order.assingedDE = deliveryExecutives[deliveryExecutiveMinIndex].id;
                deliveryExecutives[deliveryExecutiveMinIndex].assigned = true;
                deliveryExecutives[deliveryExecutiveMinIndex].assignedOrder = order.id;
            }
        });
        return {
            orders,
            deliveryExecutives
        };
    },

    delayTime: ({
        LEFTOVER,
        DELAYTIME_THRESHOLD
    }) => ({
        orders,
        deliveryExecutives
    }) => {

        _.forEach(deliveryExecutives, (deliveryExecutive) => {
            let maxOrderIndex;
            let maxDelayTime = 0;

            if (deliveryExecutive.assigned) return;

            _.forEach(orders, (order, orderIndex) => {
                let delayTime = util.getTime(order.ordered_time);
                if (!order.assigned && (LEFTOVER || delayTime >= DELAYTIME_THRESHOLD) && delayTime > maxDelayTime) {
                    maxOrderIndex = orderIndex;
                    maxDelayTime = delayTime;
                }
            });

            if (maxOrderIndex != undefined) {
                orders[maxOrderIndex].assigned = true;
                orders[maxOrderIndex].assingedDE = deliveryExecutive.id;
                deliveryExecutive.assigned = true;
                deliveryExecutives.assignedOrder = orders[maxOrderIndex].id;
            }

        });
        return {
            orders,
            deliveryExecutives
        };
    },

    leftOver: ({
        LEFTOVERALGO,
        FIRSTMILE_THRESHOLD,
        WAITINGTIME_THRESHOLD,
        DELAYTIME_THRESHOLD
    }) => ({
        orders,
        deliveryExecutives
    }) => {
        let result = {};
        switch (LEFTOVERALGO) {
            case 'FIRSTMILE':
                result = algorithms.firstMile(FIRSTMILE_THRESHOLD)({
                    orders,
                    deliveryExecutives
                });
                break;
            case 'DELAYTIME':
                result = algorithms.delayTime(DELAYTIME_THRESHOLD)({
                    orders,
                    deliveryExecutives
                });
                break;
            case 'WAITINGTIME':
                result = algorithms.delayTime(WAITINGTIME_THRESHOLD)({
                    orders,
                    deliveryExecutives
                });
                break;
        }
        return result;
    }
};

/*
  Formulate Result -> This function will modify the response as per the requirement
*/

const formulateResult = (result) => {
    let assignment = [];
    _.forEach(result.orders, order => {
        assignment.push({
            order_id: order.id,
            de_id: order.assingedDE
        });
    });
    return assignment;
}


/*
  This is executer function
  This will call the required function ie. algorithm, formulateResponse etc
*/
const delivery = (orders, deliveryExecutives) => {
    const FIRSTMILE_THRESHOLD = 330;
    const WAITINGTIME_THRESHOLD = 10000000000000;
    const DELAYTIME_THRESHOLD = 10;
    const LEFTOVERALGO = 'FIRSTMILE';

    /* Order of Algorithm
       We can change the order of algorithms accoriding to requirement/areas
       e.g Some areas might want to increase efficiency i.e maximum utilization of delivery boys.
       On the other hand, some might want to increase quality i.e prioritize order delay, equal distribution of orders among delivery boys
       This can be easily incorporated by changing the order of the algo.
       LEFTOVERALGO will be the final algorithm which will assign the left orders to delivery executives
       There are different THRESHOLD . The idea is to use a particular a algorithm upto the specific THRESHOLD and then use another algorithm for rest of orders.
       If there is some orders still left LEFTOVER algo can be used to accomodate it.
    */

    const result = fp.compose(
        algorithms.leftOver({
            LEFTOVERALGO,
            DELAYTIME_THRESHOLD,
            WAITINGTIME_THRESHOLD,
            FIRSTMILE_THRESHOLD
        }),
        algorithms.delayTime({
            DELAYTIME_THRESHOLD
        }),
        algorithms.waitingTime({
            WAITINGTIME_THRESHOLD
        }),
        algorithms.firstMile({
            LEFTOVER: false,
            FIRSTMILE_THRESHOLD
        })
    )({
        orders,
        deliveryExecutives
    });
    const response = formulateResult(result);
    return response;
};



module.exports = delivery;

/*
  TEST CODE
*/
(function() {
    if (require.main === module) {
        let response = delivery([{
                "resturant_location": "30.849635,-83.24559",
                "ordered_time": "1518343432748",
                "id": 123
            },
            {
                "resturant_location": "30.849635,-83.24559",
                "ordered_time": "1518343425364",
                "id": 321
            }
        ], [{
                "id": 567,
                "current_location": "27.950575,-82.457178",
                "last_order_delivered_time": "1518343432748"
            },
            {
                "id": 568,
                "current_location": "27.990575,-82.457178",
                "last_order_delivered_time": "1518343425364"
            },
            {
                "id": 569,
                "current_location": "27.950575,-82.457178",
                "last_order_delivered_time": "1518343439512"
            }
        ]);
        console.log(response);
    }
}());

