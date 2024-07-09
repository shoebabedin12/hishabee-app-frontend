import React, { useRef } from 'react';

const Invoice = ({ invoiceData }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };
  const { month, startDate, payingDate, paymentDetails, totalPrice } = invoiceData;

  return (
    <div>
      <div ref={printRef} style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', padding: '5px', maxWidth: '80mm', margin: 'auto', lineHeight: '1.2' }}>
        <h2 style={{ fontSize: '14px', textAlign: 'center', margin: '5px 0' }}>Invoice</h2>
        <p><strong>Month:</strong> {new Date(month).toLocaleDateString()}</p>
        <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Paying Date:</strong> {payingDate ? new Date(payingDate).toLocaleDateString() : 'Pending'}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc' }}>
              <th style={{ padding: '2px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Product</th>
              <th style={{ padding: '2px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Qty</th>
              <th style={{ padding: '2px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Type</th>
              <th style={{ padding: '2px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {paymentDetails.map((detail, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '2px', textAlign: 'left' }}>{detail.productName}</td>
                <td style={{ padding: '2px', textAlign: 'right' }}>{detail.weightAmount}</td>
                <td style={{ padding: '2px', textAlign: 'right' }}>{detail.weightType}</td>
                <td style={{ padding: '2px', textAlign: 'right' }}>{detail.price}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1px solid #000' }}>
              <td colSpan="3" style={{ padding: '2px', textAlign: 'left', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: '2px', textAlign: 'right', fontWeight: 'bold' }}>{totalPrice}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button onClick={handlePrint} style={{ marginTop: '10px', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
        Print
      </button>
    </div>
  );
};

export default Invoice;
