sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], function(MessageToast, MessageBox, Fragment) {
    "use strict";

    return {

        pDialog: null,

        /**
         * Open dialog
         */
onBulkApproval: function(oContext, aSelectedContexts) {
    if (!aSelectedContexts || aSelectedContexts.length === 0) {
        MessageBox.warning("Please select at least one order.");
        return;
    }

    // Extract order numbers
    var aOrders = aSelectedContexts.map(ctx => ctx.getObject().orderNumber);

    // Create input controls for MessageBox
    var oReasonInput = new sap.m.Input({ placeholder: "Enter reason..." });
    var oApproveSwitch = new sap.m.Switch({
        state: true,
        textOn: "Approve",
        textOff: "Reject"
    });

    var oVBox = new sap.m.VBox({
        items: [
            new sap.m.Label({ text: "Approve Load?" }),
            oApproveSwitch,
            new sap.m.Label({ text: "Reason Code" }),
            oReasonInput
        ],
        class: "sapUiSmallMargin"
    });

    // Show MessageBox
    MessageBox.show(oVBox, {
        icon: MessageBox.Icon.INFORMATION,
        title: "Bulk Approval",
        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
        onClose: function(oAction) {
            if (oAction === MessageBox.Action.OK) {
                var bApproveLoad = oApproveSwitch.getState();
                var sReasonCode = oReasonInput.getValue();

                // Condition: Reason code is mandatory only if ApproveLoad is false (rejected)
                if (!bApproveLoad && !sReasonCode) {
                    MessageBox.warning("Reason Code is required when rejecting the order.");
                    return;
                }

                // CAP action call using bindContext
                var oModel = aSelectedContexts[0].getModel();
                var oAction = oModel.bindContext("/approveOrders(...)");

                oAction.setParameter("orders", aOrders);
                oAction.setParameter("approveLoad", bApproveLoad);
                oAction.setParameter("reasonCode", sReasonCode);

                oAction.execute().then(function(oResponse) {
                    var oResult = oAction.getBoundContext().getObject();
                    console.log("Response:", oResult);
                    MessageToast.show("Orders approved successfully!");
                    oModel.refresh();
                }).catch(function(oError) {
                    console.error("Action failed:", oError);
                    MessageBox.error("Bulk approval failed: " + oError.message);
                });
            }
        }.bind(this)
    });
}


    };
});
