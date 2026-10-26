
import React, { useState, useEffect } from 'react';
import App from '../../App';

export default function InvoiceManager() {
  const [invoices, setInvoices] = useState([]);
  

  const API_URL = 'http://localhost:3000/api/invoice'; 

  // Filter States
  const [filters, setFilters] = useState({ search: '', status: '', startDate: '', endDate: '' });

  // Form States
  
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/customer');
      if (!response.ok) throw new Error('Failed to load customers list');
      const data = await response.json();
      setCustomers(data); // Assuming API returns an array of objects
    } catch (error) {
      console.error("Error fetching list:", error);
    } 
  };
  const [customerId, setCustomerId] = useState('');
  const [invDate, setInvDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: 1, price: 0 }]);
  
  // Payment States
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Computations
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const taxAmount = subtotal * 0.18; // 18% GST Example
  const total = subtotal + taxAmount;
  const balanceAmount = total - amountPaid;


  // Fetch invoices with active filters
  const fetchInvoices = async () => {
    const queryParams = new URLSearchParams(filters).toString();
    try {
      const res = await fetch(`${API_URL}?${queryParams}`);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices", err);
    }
  };

  // handle items

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [activeItems, setActiveItems] = useState([]);

    const handleRowClick = async (invoice) => {
    setSelectedInvoice(invoice);
    setActiveItems([]); 
    
    try {
        const res = await fetch(`http://localhost:3000/api/invoice/${invoice.id}`);
        if (res.ok) {
        const data = await res.json();
        setActiveItems(data);
        }
    } catch (err) {
        console.error("Error loading items for modal:", err);
    }
    };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, [filters]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      invoiceData: { customer_id: customerId, inv_date: invDate, due_date: dueDate, subtotal, tax_amount: taxAmount, total },
      items,
      paymentData: { amount_paid: amountPaid, payment_method: paymentMethod, notes: paymentNotes }
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Invoice & Payment saved successfully!");
        fetchInvoices(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1100px', margin: '0 auto' }}>
      <h1>Invoice & Payment Manager</h1>

      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '4px' }}>
        <h3>Invoice Details</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <select 
                value={customerId} 
                onChange={(e) => setCustomerId(e.target.value)} 
                required
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
                >
                <option value="">-- Select Customer --</option>
                {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.gst ? `(${customer.gst})` : ''}
                    </option>
                ))}
            </select>
          <input type="date" placeholder="Invoice Date" onChange={e => setInvDate(e.target.value)} required />
          <input type="date" placeholder="Due Date" onChange={e => setDueDate(e.target.value)} required />
        </div>

        <h3>Items</h3>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(idx, 'description', e.target.value)} required style={{ flex: 2 }} />
            <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '70px' }} />
            <input type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '100px' }} />
            <span>Total: ${(item.quantity * item.price).toFixed(2)}</span>
          </div>
        ))}
        <button type="button" onClick={() => setItems([...items, { description: '', quantity: 1, price: 0 }])}>+ Add Item</button>

        <h3>3. Payment Registration</h3>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <label>Amount Paid Now: 
            <input type="number" step="0.01" value={amountPaid} onChange={e => setAmountPaid(parseFloat(e.target.value) || 0)} />
          </label>
          <label>Method: 
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </label>
          <input type="text" placeholder="Payment Notes" onChange={e => setPaymentNotes(e.target.value)} />
        </div>

        <div style={{ textAlign: 'right', background: '#fff', padding: '10px', borderRadius: '4px' }}>
          <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
          <p>GST (18%): ₹{taxAmount.toFixed(2)}</p>
          <h4>Grand Total: ₹{total.toFixed(2)}</h4>
          <h4 style={{ color: 'red' }}>Balance Due: ₹{balanceAmount.toFixed(2)}</h4>
        </div>
        <button type="submit" style={{ background: '#28a745', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', marginTop: '10px' }}>Save Invoice & Payment</button>
      </form>

      {/* FILTER CONTROL PANEL */}
      <h2 style={{ marginTop: '40px' }}>Invoice Records & History</h2>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#e9ecef', padding: '15px', borderRadius: '6px' }}>
        <input type="text" placeholder="Search ID or Customer..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
        </select>
        <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
      </div>

      {/* DATA TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1" cellPadding="10">
        <thead>
          <tr style={{ background: '#343a40', color: '#fff' }}>
            <th>Invoice ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Grand Total</th>
            <th>Paid Amount</th>
            <th>Balance Due</th>
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(invoices) ? invoices : []).map(inv => (
            <tr key={inv.id}
            onClick={() => handleRowClick(inv)} 
            style={{ cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f3f5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
              <td>{inv.inv_id}</td>
              <td>{inv.customer_name}</td>
              <td>{new Date(inv.inv_date).toLocaleDateString()}</td>
              <td><span style={{ padding: '4px 8px', borderRadius: '4px', background: inv.status === 'paid' ? '#d4edda' : '#fff3cd' }}>{inv.status}</span></td>
              <td>₹{parseFloat(inv.total).toFixed(2)}</td>
              <td style={{ color: 'green' }}>₹{parseFloat(inv.paid_amount).toFixed(2)}</td>
              <td style={{ color: 'red', fontWeight: 'bold' }}>₹{parseFloat(inv.balance_amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* POPUP MODAL OVERLAY */}
        {selectedInvoice && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
            background: '#fff', padding: '25px', borderRadius: '8px', maxWidth: '600px', width: '100%', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h3>Details for {selectedInvoice.inv_id}</h3>
                <button onClick={() => setSelectedInvoice(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>&times;</button>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                <p><strong>Customer:</strong> {selectedInvoice.customer_name}</p>
                <p><strong>Date:</strong> {new Date(selectedInvoice.inv_date).toLocaleDateString()}</p>
            </div>

            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Items List</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }} border="1" cellPadding="8">
                <thead>
                <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ textAlign: 'left' }}>Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
                </thead>
                <tbody>
                {activeItems.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>Loading items...</td></tr>
                ) : (
                    activeItems.map(item => (
                    <tr key={item.id}>
                        <td>{item.description}</td>
                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>₹{parseFloat(item.amount).toFixed(2)}</td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>

            <div style={{ textAlign: 'right', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                <p><strong>Grand Total:</strong> ₹{parseFloat(selectedInvoice.total).toFixed(2)}</p>
                <p style={{ color: 'green' }}><strong>Amount Paid:</strong> ₹{parseFloat(selectedInvoice.paid_amount).toFixed(2)}</p>
                <p style={{ color: 'red' }}><strong>Balance Due:</strong> ₹{parseFloat(selectedInvoice.balance_amount).toFixed(2)}</p>
            </div>
            </div>
        </div>
        )}

    </div>
  );
}
