import { useState } from 'react'
import './App.css'
import Customer from './components/customer/customer';
import InvoiceManager from './components/invoice/invoice';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        {/* <Customer/> */}
        <InvoiceManager/>
      </section>
    </>
  )
}

export default App
