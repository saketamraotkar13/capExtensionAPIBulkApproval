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
onBulkApproval: function (oContext, aSelectedContexts) {
    if (!aSelectedContexts || aSelectedContexts.length === 0) {
        sap.m.MessageBox.warning("Please select at least one order.");
        return;
    }

    var aOrders = aSelectedContexts.map(ctx => ctx.getObject().orderNumber);
    var oModel = aSelectedContexts[0].getModel();

    // Reason Code ComboBox (always enabled)
    var oReasonCombo = new sap.m.ComboBox({
        width: "100%",
        placeholder: "Select Reason Code...",
        enabled: true, // always open
        items: {
            path: "/reasonCodeVH",
            template: new sap.ui.core.ListItem({
                key: "{reasonCode}",
                text: "{reasonCode} - {description}"
            })
        }
    });

    // Approve Load Checkbox
    var oApproveCheckbox = new sap.m.CheckBox({
        text: "Approve Load",
        selected: true
        // No select event needed for enabling/disabling dropdown
    });

    // VBox layout for spacing
    var oVBox = new sap.m.VBox({
        width: "100%",
        items: [
            oApproveCheckbox,
            new sap.m.Label({ text: "Reason Code", design: "Bold" }),
            oReasonCombo
        ],
        class: "sapUiSmallMargin sapUiMediumPadding"
    });

    // Dialog Definition
    var oDialog = new sap.m.Dialog({
        title: "Bulk Approval",
        contentWidth: "400px",
        type: "Message",
        content: [oVBox],
        beginButton: new sap.m.Button({
            text: "Confirm",
            type: "Emphasized",
            press: async function () {
                var bApproveLoad = oApproveCheckbox.getSelected();
                var sReasonCode = oReasonCombo.getSelectedKey();

                // Validation: Reason required only when rejecting
                if (!bApproveLoad && !sReasonCode) {
                    sap.m.MessageBox.warning("Reason Code is required when rejecting the order.");
                    return;
                }

                try {
                    var oAction = oModel.bindContext("/approveOrders(...)");
                    oAction.setParameter("orders", aOrders);
                    oAction.setParameter("approveLoad", bApproveLoad);

                    // Only pass reasonCode if selected
                    if (sReasonCode) {
                        oAction.setParameter("reasonCode", sReasonCode);
                    }

                    await oAction.execute();

                    sap.m.MessageToast.show("Orders processed successfully.");
                    oModel.refresh();
                } catch (oError) {
                    console.error("Bulk approval failed:", oError);
                    sap.m.MessageBox.error("Bulk approval failed: " + (oError.message || "Unknown error"));
                } finally {
                    oDialog.close();
                }
            }
        }),
        endButton: new sap.m.Button({
            text: "Cancel",
            press: function () {
                oDialog.close();
            }
        }),
        afterClose: function () {
            oDialog.destroy();
        }
    });

    // Attach the model for ComboBox binding
    oDialog.setModel(oModel);

    // Add compact Fiori styling
    oDialog.addStyleClass("sapUiContentPadding sapUiSizeCompact");

    oDialog.open();
}




    };
});
