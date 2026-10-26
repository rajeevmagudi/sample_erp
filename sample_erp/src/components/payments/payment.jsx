import React, { useState, useEffect } from 'react';

export default function Payment() {
  // Collection States
  const [outstandings, setOutstandings] = useState([]);
  const [targetInvoices, setTargetInvoices] = useState([]);
  
  // Selection and Input States
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payNotes, setPayNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Initial Load: Pull debtor report data
  const loadOutstandingReport = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/payment');
      if (res.ok) {
        const data = await res.json();
        setOutstandings(data);
      }
    } catch (err) {
      console.error("Error loading debtor lists", err);
    }
  };

  useEffect(() => {
    loadOutstandingReport();
  }, []);

  // When customer is picked, load their unbalanced invoices
  const handleCustomerSelect = async (customerId) => {
    setSelectedCustomerId(customerId);
    setSelectedInvoice(null);
    setPayAmount('');
    setValidationError('');
    
    if (!customerId) {
      setTargetInvoices([]);
      return;
    }

    try {
      // Re-uses your filtered invoices endpoint with search params
      const res = await fetch(`http://localhost:3000/api/invoice?search=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        // Filter out fully paid records to keep it clean
        const activeDebts = data.filter(inv => parseFloat(inv.balance_amount) > 0);
        setTargetInvoices(activeDebts);
      }
    } catch (err) {
      console.error("Failed to query open records", err);
    }
  };

  // Track invoice balance variations
  const handleAmountInput = (val) => {
    setPayAmount(val);
    if (!selectedInvoice) return;

    const inputNum = parseFloat(val) || 0;
    const maxAllowed = parseFloat(selectedInvoice.balance_amount);

    if (inputNum > maxAllowed) {
      setValidationError(`⚠️ Overpayment alert! Maximum allowed amount is ₹${maxAllowed.toFixed(2)}`);
    } else {
      setValidationError('');
    }
  };

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (validationError || !selectedInvoice || !payAmount) return;

    const payload = {
      invoice_id: selectedInvoice.id,
      amount_paid: parseFloat(payAmount),
      payment_method: payMethod,
      notes: payNotes
    };

    try {
      const res = await fetch('http://localhost:3000/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();

      if (res.ok) {
        alert("Payment logged successfully!");
        // Clear fields and refresh tables
        setPayAmount('');
        setPayNotes('');
        setSelectedInvoice(null);
        setSelectedCustomerId('');
        setTargetInvoices([]);
        loadOutstandingReport();
      } else {
        alert(`Transaction Denied: ${resData.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Collection & Accounts Receivable Management</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h2>Record Collection Payment</h2>
          <form onSubmit={handlePaymentSubmit} style={{ marginTop: '20px' }}>
            
            <label style={{ display: 'block', marginBottom: '15px' }}>
              <strong>Step 1: Choose Customer Account</strong>
              <select 
                value={selectedCustomerId} 
                onChange={e => handleCustomerSelect(e.target.value)} 
                style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="">-- Select Debtor --</option>
                {outstandings.map(cust => (
                  <option key={cust.customer_id} value={cust.customer_id}>
                    {cust.customer_name} (Due: ₹{parseFloat(cust.outstanding_amount).toFixed(2)})
                  </option>
                ))}
              </select>
            </label>

            {selectedCustomerId && (
              <label style={{ display: 'block', marginBottom: '15px' }}>
                <strong>Step 2: Choose Invoice Record</strong>
                <select 
                  value={selectedInvoice ? selectedInvoice.id : ''} 
                  onChange={e => {
                    const inv = targetInvoices.find(i => i.id === parseInt(e.target.value));
                    setSelectedInvoice(inv || null);
                    setPayAmount('');
                    setValidationError('');
                  }}
                  style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="">-- Select Open Bill --</option>
                  {targetInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.inv_id} - Total: ₹{parseFloat(inv.total).toFixed(2)} | Balance: ₹{parseFloat(inv.balance_amount).toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {selectedInvoice && (
              <div style={{ background: '#fff', padding: '15px', borderRadius: '6px', marginBottom: '15px', borderLeft: '4px solid #007bff' }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>Active Selection:</strong> {selectedInvoice.inv_id}</p>
                <h4 style={{ margin: '0', color: '#dc3545' }}>Collectible Limit: ₹{parseFloat(selectedInvoice.balance_amount).toFixed(2)}</h4>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <label style={{ flex: 1 }}>
                <strong>Amount Collected (₹)</strong>
                <input 
                  type="number" 
                  step="0.01" 
                  disabled={!selectedInvoice} 
                  value={payAmount} 
                  onChange={e => handleAmountInput(e.target.value)} 
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
                  required 
                />
              </label>
              <label style={{ flex: 1 }}>
                <strong>Method</strong>
                <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
                  <option value="UPI">UPI / QR</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Net-Banking</option>
                  <option value="Card">POS Terminal Card</option>
                </select>
              </label>
            </div>

            {validationError && (
              <div style={{ color: '#721c24', background: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>
                {validationError}
              </div>
            )}

            <label style={{ display: 'block', marginBottom: '20px' }}>
              <strong>Receipt Memo / Reference Notes</strong>
              <input type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)} placeholder="Txn ID or remarks..." style={{ display: 'block', width: '100%', padding: '8px', marginTop: '5px' }} />
            </label>

            <button 
              type="submit" 
              disabled={!!validationError || !selectedInvoice || !payAmount}
              style={{
                width: '100%', padding: '12px', background: (validationError || !selectedInvoice || !payAmount) ? '#6c757d' : '#28a745',
                color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'
              }}
            >
              Post Collection Entry
            </button>
          </form>
        </div>

        <div>
          <h2>Outstanding Ledger (Largest First)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }} border="1" cellPadding="12">
            <thead>
              <tr style={{ background: '#212529', color: '#fff' }}>
                <th>Rank</th>
                <th>Client Account</th>
                <th>Billed Volume</th>
                <th>Aggregated Receipts</th>
                <th style={{ background: '#dc3545' }}>Outstanding Due</th>
              </tr>
            </thead>
            <tbody>
                {outstandings.length === 0 ? (
                    <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#6c757d' }}>
                        All consumer outstanding clear. Nice work!
                    </td>
                    </tr>
                ) : (
                    outstandings.map((cust, idx) => (
                    <tr key={cust.customer_id} style={{ background: idx === 0 ? '#fff3cd' : '#fff' }}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>#{idx + 1}</td>
                        <td>
                        <div><strong>{cust.customer_name}</strong></div>
                        <small style={{ color: '#6c757d' }}>{cust.phone}</small>
                        </td>
                        <td>₹{parseFloat(cust.total_billed).toFixed(2)}</td>
                        <td style={{ color: 'green' }}>₹{parseFloat(cust.total_paid).toFixed(2)}</td>
                        
                        {/* ADD THIS BALANCE LINE HERE */}
                        <td style={{ color: 'red', fontWeight: 'bold' }}>
                        ₹{parseFloat(cust.outstanding_amount).toFixed(2)}
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
        </table>
        </div>
       </div>
    </div>
  )
}
