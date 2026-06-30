import { StrictMode, Component, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: String(error?.message || error) };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{background:'#020617',color:'#f8fafc',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',fontFamily:'sans-serif'}}>
          <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🔮</div>
          <h1 style={{color:'#fbbf24',fontSize:'1.5rem',fontWeight:'bold',marginBottom:'0.5rem'}}>AstroVedic - Loading Error</h1>
          <p style={{color:'#94a3b8',marginBottom:'1rem',textAlign:'center'}}>Error: {this.state.error}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
            style={{background:'#6366f1',color:'white',border:'none',borderRadius:'0.5rem',padding:'0.75rem 1.5rem',cursor:'pointer',fontWeight:'bold'}}
          >
            🔄 Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
