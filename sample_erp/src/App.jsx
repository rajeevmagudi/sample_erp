import { useState } from 'react'
import './App.css'
import Customer from './components/customer/customer';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <Customer/>
      </section>
    </>
  )
}

export default App
