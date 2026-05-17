// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom'
export const NotFoundPage = () => (
  <div className="not-found">
    <span className="not-found-code">404</span>
    <h2>Page not found</h2>
    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
  </div>
)
