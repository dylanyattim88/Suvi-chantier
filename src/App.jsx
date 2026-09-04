import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CurrencyProvider } from './lib/currency'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Suppliers from './pages/Suppliers'
import Payments from './pages/Payments'

export default function App() {
  return (
    <CurrencyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projets" element={<Projects />} />
            <Route path="/projets/:id" element={<ProjectDetail />} />
            <Route path="/fournisseurs" element={<Suppliers />} />
            <Route path="/paiements" element={<Payments />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CurrencyProvider>
  )
}
