import { useState, useEffect } from 'react';
import './customer.css';

export default function Customer() {
  //  Manage form state in a single object
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gst: ''
  });


  const [customers, setCustomers] = useState([]);


  const API_URL = 'http://localhost:3000/api/customer'; 

  //  Track form validation errors
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Handle input value changes dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors as the user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validate form inputs
  const validateForm = () => {
    let formErrors = {};
    if (!formData.name.trim()) formErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Email address is invalid';
    }
    if (formData.phone.trim().length < 10 || formData.phone.trim().length > 10 ) formErrors.phone = 'Phone Must need to 10 digit';
    
    return formErrors;
  };

  // fetch data

 const fetchCustomers = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to load customers list');
      const data = await response.json();
      setCustomers(data); // Assuming API returns an array of objects
    } catch (error) {
      console.error("Error fetching list:", error);
    } finally {
      setListLoading(false);
    }
  };
  // Handle form submission
  const handleSubmit = async(e) => {
    e.preventDefault(); // Prevents page reload
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      console.log('Form Submitted Successfully:', formData);
      setSubmitted(true);
      try {
      // Replace with your actual ERP / API endpoint
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
       if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Success workflow
      setMessage({ text: 'Customer saved successfully!', isError: false });
      
      // Reset form
      setFormData({ username: '', email: '', phone: '', gst: '' });

    } catch (error) {
      // Error workflow
      setMessage({ text: error.message, isError: true });
    } finally {
      setIsLoading(false);
    }
      
    } else {
      setErrors(validationErrors);
      setSubmitted(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div>
      <h2>Customers</h2>
      
      {submitted && <p>Creation sent successfully!</p>}
      <div className='formContainer'>
        <form onSubmit={handleSubmit} className='formbox'>
          {/* Name Input */}
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: errors.name ? '1px solid red' : '1px solid #ccc' }}
            />
            {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: errors.email ? '1px solid red' : '1px solid #ccc' }}
            />
            {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
          </div>

          {/* Phone Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone:</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: errors.message ? '1px solid red' : '1px solid #ccc' }}
            />
            {errors.message && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.message}</span>}
          </div>

          {/* GST Input */}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>GST:</label>
            <input
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              rows="4"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: errors.message ? '1px solid red' : '1px solid #ccc' }}
            />
            {errors.message && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.message}</span>}
          </div>

          <button type="submit" style={{ padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Submit
          </button>
        </form>
        
      </div>
      <div className='listsContainer'>
           <div style={{ flex: 1.5, padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {customers.map((cust, index) => (
              <div 
                key={cust.id || index} // Prefers database unique ID, falls back to index
                style={{ 
                  padding: '12px', 
                  backgroundColor: '#fff', 
                  marginBottom: '10px', 
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >

                <strong style={{ display: 'block', color: '#333' }}>{cust.name}</strong>
                <span style={{ fontSize: '13px', color: '#666', display: 'block' }}>Email: {cust.email}</span>
                <span style={{ fontSize: '13px', color: '#666', display: 'block' }}>Phone: {cust.phone}</span>
              </div>
            ))}
          </div>
      </div>
      </div>
    </div>
  );
}
