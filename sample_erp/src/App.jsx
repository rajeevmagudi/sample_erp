import { useState } from 'react'
import './App.css'
import Customer from './components/customer/customer';
import InvoiceManager from './components/invoice/invoice';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/navBars/sideBar';


function App() {
  const [count, setCount] = useState(0)

  return (
    // <>
    //   <section id="center">
    //     {/* <Customer/> */}
    //     <InvoiceManager/>
    //   </section>
    // </>
     <BrowserRouter>
      <div className="app-container">
        {/* Persistent Sidebar */}
        <Sidebar />
        
        {/* Main Content View */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/customers" replace />} />
            <Route path="/customers" element={<Customer />} />
            <Route path="/invoices" element={<InvoiceManager />} />
            {/* <Route path="/accounts" element={<Accounts />} />
            <Route path="/payments" element={<Payments />} /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
