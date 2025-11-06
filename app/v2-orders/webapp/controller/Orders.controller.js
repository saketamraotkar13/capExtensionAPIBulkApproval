sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/CheckBox",
    "sap/m/Button"
], function (Controller, MessageToast, MessageBox, Dialog, Label, Select, Item, CheckBox, Button) {
    "use strict";

    return Controller.extend("v2orders.controller.Orders", {

        _getSelectedOrders: function () {
            const oSmartTable = this.byId("smartTable");
            const oTable = oSmartTable.getTable();
            let aContexts = [];

            if (oTable.getSelectedIndices) {
                aContexts = oTable.getSelectedIndices()
                    .map(i => oTable.getContextByIndex(i))
                    .filter(ctx => ctx);
            } else if (oTable.getSelectedItems) {
                aContexts = oTable.getSelectedItems()
                    .map(item => item.getBindingContext())
                    .filter(ctx => ctx);
            }

            return aContexts.map(ctx => ctx.getProperty("orderNumber"));
        },

        _getFilterValues: function () {
            const oSFB = this.byId("smartFilterBar");
            const oFilters = {};
            oSFB.getFilterData && Object.assign(oFilters, oSFB.getFilterData());
            return oFilters;
        },

        onApproveSelected: function () {
            const aOrders = this._getSelectedOrders();
            const oSmartTable = this.byId("smartTable");
            const oModel = this.getView().getModel();
            const sServiceUrl = oModel.sServiceUrl + "/approveOrders";

            // --- UI Elements ---
            const oApproveCheck = new CheckBox("approveCheck", 
                { text: "Approve Load", selected: true });

            // Reason Code dropdown — nothing selected by default
            const oReasonSelect = new Select("reasonSelect", {
                width: "100%",
                selectedKey: "",
                forceSelection: false, // prevent auto-select of first item
                items: {
                    path: "/reasonCodeVH",
                    template: new Item({
                        key: "{reasonCode}",
                        text: "{reasonCode} - {description}"
                    })
                }
            });

            // Placeholder
            oReasonSelect.addItem(new Item({ key: "", text: "-- Select Reason Code --" }));

            const oApproveAllCheck = new CheckBox("approveAllCheck", {
                text: "Approve All Filtered Orders",
                selected: false
            });

            const oSelectedCountLabel = new Label({
                text: `Selected Orders: ${aOrders.length}`
            });


            var oVBox = new sap.m.VBox({
                width: "100%",
                items: [                    
                    oApproveCheck,
                    new Label({ text: "Reason Code", labelFor: "reasonSelect" }),
                    oReasonSelect,
                    oApproveAllCheck,
                    oSelectedCountLabel
                ],
                class: "sapUiSmallMargin sapUiMediumPadding"                
            });

            // --- Dialog ---
            const oDialog = new Dialog({
                title: "Approve Orders",
                contentWidth: "400px",
                content: [oVBox],
                beginButton: new Button({
                    text: "Save",
                    type: "Emphasized",
                    press: function () {
                        const bApproveLoad = oApproveCheck.getSelected();
                        const sReason = oReasonSelect.getSelectedKey();
                        const bApproveAll = oApproveAllCheck.getSelected();

                        // ✅ Reason Code is mandatory only when Approve Load = false
                        if (!bApproveLoad && !sReason) {
                            MessageToast.show("Reason Code is mandatory when Approve Load is unchecked.");
                            return;
                        }

                        // ✅ Must select some orders or choose Approve All
                        if (!bApproveAll && !aOrders.length) {
                            MessageToast.show("Please select at least one order or check 'Approve All Filtered Orders'.");
                            return;
                        }

                        oDialog.close();

                        const payload = {
                            approveLoad: bApproveLoad,
                            reasonCode: sReason
                        };

                        if (bApproveAll) {
                            payload.filters = JSON.stringify(this._getFilterValues());
                        } else {
                            payload.orders = aOrders;
                        }

                        // --- CAP Action Call ---
                        $.ajax({
                            url: sServiceUrl,
                            method: "POST",
                            contentType: "application/json",
                            data: JSON.stringify(payload),
                            success: function (oData) {
                                MessageToast.show(oData?.message || "Orders updated successfully.");
                                oSmartTable.rebindTable();
                            }.bind(this),
                            error: function (oErr) {
                                const sMsg = oErr.responseJSON?.error?.message || "Error updating orders.";
                                MessageBox.error(sMsg);
                            }
                        });
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () { oDialog.close(); }
                }),
                afterClose: function () { oDialog.destroy(); }
            });

            // --- Update label when Approve All is toggled ---
            oApproveAllCheck.attachSelect(function (oEvent) {
                const bAll = oEvent.getParameter("selected");
                oSelectedCountLabel.setText(bAll ? "Selected Orders: All Filtered" : `Selected Orders: ${aOrders.length}`);
            });

            oDialog.setModel(oModel);
            oDialog.open();
        }
    });
});
