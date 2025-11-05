const cds = require('@sap/cds');

class MyOrderApprovalService extends cds.ApplicationService {
    async init() {

      // this.on('UPDATE', 'Orders', async (req) => {

      //   const { Orders } = this.entities;
      //   const { approveLoad, reasonCode } = req.data;
      //   // Check if reasonCode is empty when approveLoad is false
      //       if (approveLoad === false && (!reasonCode || reasonCode.trim() === '')) {
      //           req.error(400, 'Reason Code is mandatory when Approve Load is No.');
      //       }
      //   });



        this.on('approveOrders', async (req) => {
            const { orders, approveLoad, reasonCode } = req.data;

            if (!orders || orders.length === 0) {
                return req.error(400, 'Please provide at least one order.');
            }

            if (approveLoad === false && (!reasonCode || reasonCode.trim() === '')) {
                return req.error(400, 'Reason Code is mandatory when Approve Load is No.');
            }

            const tx = cds.transaction(req);

            for (const orderNumber of orders) {
                await tx.run(
                    UPDATE('strbw.Orders')
                        .set({ approveLoad: approveLoad, reasonCode : reasonCode })
                        .where({ orderNumber })
                );
            }

            return true;
        });

        await super.init();
    }
}

module.exports = MyOrderApprovalService;
