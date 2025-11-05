sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"uiapproval/test/integration/pages/OrdersList",
	"uiapproval/test/integration/pages/OrdersObjectPage"
], function (JourneyRunner, OrdersList, OrdersObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('uiapproval') + '/test/flp.html#app-preview',
        pages: {
			onTheOrdersList: OrdersList,
			onTheOrdersObjectPage: OrdersObjectPage
        },
        async: true
    });

    return runner;
});

