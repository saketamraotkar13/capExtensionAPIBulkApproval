const cds = require('@sap/cds');

class MyOrderApprovalService extends cds.ApplicationService {
  async init() {
    await super.init();

    this.on('approveOrders', async (req) => {
      const { orders, approveLoad, reasonCode } = req.data;

      if (!orders?.length) return req.error(400, 'Please provide at least one order.');
      if (approveLoad === false && (!reasonCode || reasonCode.trim() === ''))
        return req.error(400, 'Reason Code is mandatory when Approve Load is No.');
      if(approveLoad && reasonCode){

      
      await UPDATE('strbw.Orders')
        .set({ approveLoad, reasonCode })
        .where({ orderNumber: { in: orders } });
      }
      else {
        
      
      await UPDATE('strbw.Orders')
        .set({ approveLoad })
        .where({ orderNumber: { in: orders } });
      }
      console.log(`✅ Updated ${orders.length} orders`);

      return {
        success: true,
        message: `${orders.length} orders updated successfully.`,
      };
    });
  }
}

module.exports = MyOrderApprovalService;
