import React from 'react';

const Portfolio = () => {
    return (
        <>
            <style>{`
        .page-header {
            padding-top: 15rem;
            padding-bottom: 5rem;
            text-align: center;
        }
        .page-header h1 {
            font-family: var(--font-heading);
            color: var(--gold-primary);
            font-size: 3.5rem;
        }
        .portfolio-item {
            position: relative;
            overflow: hidden;
            border-radius: 8px;
            cursor: pointer;
            border: 1px solid rgba(216, 166, 72, 0.2);
        }
        .portfolio-item img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        .portfolio-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .portfolio-item:hover .portfolio-overlay {
            opacity: 1;
        }
        .portfolio-item:hover img {
            transform: scale(1.1);
        }
        .portfolio-overlay h4 {
            color: var(--gold-primary);
            font-family: var(--font-heading);
            transform: translateY(20px);
            transition: transform 0.3s ease;
        }
        .portfolio-overlay p {
            color: #fff;
            transform: translateY(20px);
            transition: transform 0.3s ease 0.1s;
        }
        .portfolio-item:hover h4,
        .portfolio-item:hover p {
            transform: translateY(0);
        }
      `}</style>
            <section className="page-header">
                <div className="container">
                    <h1>Our Portfolio</h1>
                    <p className="text-light mt-3">A collection of our finest work and transformations.</p>
                </div>
            </section>
            <section className="portfolio-section pb-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '300px', background: 'linear-gradient(45deg, #1a1a1a, #333)' }}></div>
                                <div className="portfolio-overlay">
                                    <h4>Radiant Glow</h4>
                                    <p>Facial Treatment</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '300px', background: 'linear-gradient(45deg, #2c2c2c, #4a3b2a)' }}></div>
                                <div className="portfolio-overlay">
                                    <h4>Golden Touch</h4>
                                    <p>Product Launch</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '300px', background: 'linear-gradient(45deg, #111, #222)' }}></div>
                                <div className="portfolio-overlay">
                                    <h4>Mystery Unveiled</h4>
                                    <p>Brand Campaign</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '300px', background: 'linear-gradient(45deg, #333, #554422)' }}></div>
                                <div className="portfolio-overlay">
                                    <h4>Timeless Beauty</h4>
                                    <p>Anti-Aging Result</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '300px', background: 'linear-gradient(45deg, #1a1a1a, #000)' }}></div>
                                <div className="portfolio-overlay">
                                    <h4>Pure Essence</h4>
                                    <p>Organic Collection</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="portfolio-item">
                                <div style={{ height: '300px', background: 'linear-gradient(45deg, #443311, #222)' }}></div>
                                <div className="portfolio-overlay">
                                    <h4>Luxe Experience</h4>
                                    <p>Spa Interior</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default Portfolio;
