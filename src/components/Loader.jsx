import React from 'react';
import ReactDOM from 'react-dom';

const Loader = ({ fullPage = true, text = 'Loading...', overlay = false }) => {
    if (overlay) {
        return ReactDOM.createPortal(
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="spinner-border mb-3" role="status" style={{ width: '4rem', height: '4rem', color: 'var(--gold-primary)' }}>
                    <span className="visually-hidden">Loading...</span>
                </div>
                {text && <h5 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)' }}>{text}</h5>}
            </div>,
            document.body
        );
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center w-100" style={{ minHeight: fullPage ? '60vh' : '150px' }}>
            <div className="spinner-border mb-3" role="status" style={{ width: '3rem', height: '3rem', color: 'var(--gold-primary)' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
            {text && <h5 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold-light)' }}>{text}</h5>}
        </div>
    );
};

export default Loader;
