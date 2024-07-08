import React from 'react';

const Invoice = ({ invoiceData }) => {
  const { month, startDate, payingDate, paymentDetails, totalPrice } = invoiceData;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ccc', maxWidth: '600px', margin: 'auto' }}>
      <h2>Invoice</h2>
      <p><strong>Month:</strong> {new Date(month).toLocaleDateString()}</p>
      <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
      <p><strong>Paying Date:</strong> {payingDate ? new Date(payingDate).toLocaleDateString() : 'Not specified'}</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Product Name</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Weight Amount</th>
            <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {paymentDetails.map((detail, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: '8px', textAlign: 'left' }}>{detail.productName}</td>
              <td style={{ padding: '8px', textAlign: 'left' }}>{detail.weightAmount}</td>
              <td style={{ padding: '8px', textAlign: 'left' }}>{detail.price}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #000' }}>
            <td style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>Total</td>
            <td style={{ padding: '8px', textAlign: 'left' }}></td>
            <td style={{ padding: '8px', textAlign: 'left', fontWeight: 'bold' }}>{totalPrice}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Invoice;
