import React from 'react';

const Services = () => {
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
        .service-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(216, 166, 72, 0.2);
            border-radius: 8px;
            padding: 2rem;
            transition: all 0.3s ease;
            height: 100%;
            text-align: center;
        }
        .service-card:hover {
            transform: translateY(-10px);
            border-color: var(--gold-primary);
            box-shadow: 0 10px 30px rgba(216, 166, 72, 0.1);
        }
        .service-icon {
            font-size: 3rem;
            margin-bottom: 1.5rem;
            background: linear-gradient(to bottom, var(--gold-light), var(--gold-dark));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .service-card h3 {
            font-family: var(--font-heading);
            color: var(--gold-light);
            margin-bottom: 1rem;
        }
        .service-card p {
            color: rgba(255, 255, 255, 0.7);
        }
      `}</style>
            <section className="page-header">
                <div className="container">
                    <h1>Our Premium Services</h1>
                    <p className="text-light mt-3">Exquisite care tailored for your unique glow.</p>
                </div>
            </section>
            <section className="services-section pb-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-4">
                            <div className="service-card">
                                <i className="bi bi-stars service-icon"></i>
                                <h3>Luxury Facials</h3>
                                <p>Rejuvenate your skin with our signature gold-infused facial treatments tailored to your skin type.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="service-card">
                                <i className="bi bi-droplet-half service-icon"></i>
                                <h3>Skin Analysis</h3>
                                <p>Advanced AI-driven skin analysis to uncover the mysteries of your skin's unique needs.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="service-card">
                                <i className="bi bi-box-seam service-icon"></i>
                                <h3>Product Curation</h3>
                                <p>Receive a personalized set of skincare products designed to enhance your natural radiance.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="service-card">
                                <i className="bi bi-magic service-icon"></i>
                                <h3>Anti-Aging Therapy</h3>
                                <p>Timeless beauty solutions that smooth, firm, and restore your skin's youthful vitality.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="service-card">
                                <i className="bi bi-flower1 service-icon"></i>
                                <h3>Organic Rituals</h3>
                                <p>Holistic treatments using 100% organic ingredients for a pure and natural glow.</p>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-4">
                            <div className="service-card">
                                <i className="bi bi-gem service-icon"></i>
                                <h3>Bridal Packages</h3>
                                <p>Exclusive pre-wedding skincare journeys to ensure you shine brightest on your special day.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default Services;
