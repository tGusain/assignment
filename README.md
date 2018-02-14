# assignment

The Code is divided in following modules
1. Utility : all the utility function will be there is the utility file. e.g getDistance and getTime.
2. Algorithms : all the alogrithms will be added into algorithm section e.g firstMile, waitingTime, delayTime etc.
3. FormulateResult : The function/module will formulate the result.
4. Main Module (Delivery) : This is basically the handler function. It handles order of algorithm, providing THRESHOLDS, formulating result etc.


Steps to run the assignment : 
1. Clone the repo and move to assignment folder.
2. npm install
3. node delivery.js (test code function in the file will execute)

Input : 
Orders : [{
                "resturant_location": "30.849635,-83.24559",
                "ordered_time": "1518343432748",
                "id": 123
            },
            {
                "resturant_location": "30.849635,-83.24559",
                "ordered_time": "1518343425364",
                "id": 321
            }
        ]
        
DEs : [{
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
       ]
       
Output : 
An array of order to DE mappings.
[ { order_id: 123, de_id: 568 }, { order_id: 321, de_id: 567 } ]
