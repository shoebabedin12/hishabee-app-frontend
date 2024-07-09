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
       <div 
        ref={printRef} 
        style={{ 
          fontFamily: 'Arial, sans-serif', 
          fontSize: '10px', 
          padding: '10px', 
          paddingLeft: '30px',
          paddingRight: '30px',
          paddingBottom: '50px',
          maxWidth: '80mm', 
          margin: 'auto', 
          border: '1px solid #ccc',
          lineHeight: '1.2' 
        }}
      >
        <h2 style={{ fontSize: '14px', textAlign: 'center', margin: '10px 0' }}>Invoice</h2>
        <p><strong>Month:</strong> {new Date(month).toLocaleDateString()}</p>
        <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Paying Date:</strong> {payingDate ? new Date(payingDate).toLocaleDateString() : 'Pending'}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ccc', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
              <th style={{ padding: '5px', textAlign: 'left', borderBottom: '1px solid #ccc', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>Product</th>
              <th style={{ padding: '5px', textAlign: 'right', borderBottom: '1px solid #ccc', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>Qty</th>
              <th style={{ padding: '5px', textAlign: 'right', borderBottom: '1px solid #ccc', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>Type</th>
              <th style={{ padding: '5px', textAlign: 'right', borderBottom: '1px solid #ccc', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {paymentDetails.map((detail, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #ccc', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
                <td style={{ padding: '5px', textAlign: 'left',fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>{detail.productName}</td>
                <td style={{ padding: '5px', textAlign: 'right',fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>{detail.weightAmount}</td>
                <td style={{ padding: '5px', textAlign: 'right',fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>{detail.weightType}</td>
                <td style={{ padding: '5px', textAlign: 'right',fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>{detail.price}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '1px solid #000', fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>
              <td colSpan="3" style={{ padding: '5px', textAlign: 'left', fontWeight: 'bold',fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>Total</td>
              <td style={{ padding: '5px', textAlign: 'right', fontWeight: 'bold',fontFamily: 'Arial, sans-serif', fontSize: '10px' }}>{totalPrice}</td>
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
