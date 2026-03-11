import React from 'react';

const Contact = () => {
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
        .contact-form .form-control {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(216, 166, 72, 0.3);
            color: #fff;
            padding: 1rem;
        }
        .contact-form .form-control:focus {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--gold-primary);
            box-shadow: 0 0 10px rgba(216, 166, 72, 0.2);
        }
        .contact-form label {
            color: rgba(255, 255, 255, 0.7);
        }
        .contact-info-box {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(216, 166, 72, 0.2);
            padding: 2rem;
            border-radius: 8px;
            text-align: center;
            height: 100%;
            transition: transform 0.3s;
        }
        .contact-info-box:hover {
            transform: translateY(-5px);
            border-color: var(--gold-primary);
        }
        .contact-icon {
            font-size: 2rem;
            color: var(--gold-primary);
            margin-bottom: 1rem;
            display: inline-block;
        }
        .map-container iframe {
            filter: invert(90%) hue-rotate(180deg);
            border: 1px solid rgba(216, 166, 72, 0.3);
            border-radius: 8px;
        }
      `}</style>
            <section className="page-header">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p className="text-light mt-3">We'd love to hear from you. Reach out for any inquiries.</p>
                </div>
            </section>
            <section className="contact-section pb-5">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-12">
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="contact-info-box">
                                        <i className="bi bi-geo-alt contact-icon"></i>
                                        <h4 style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-heading)' }}>Address</h4>
                                        <p className="mb-0 text-light">Sadar Bazar, Nr. Juni Jel, Deesa – 385535</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="contact-info-box">
                                        <i className="bi bi-envelope contact-icon"></i>
                                        <h4 style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-heading)' }}>Email</h4>
                                        <p className="mb-0 text-light">glowmysteryin@gmail.com</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="contact-info-box">
                                        <i className="bi bi-telephone contact-icon"></i>
                                        <h4 style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-heading)' }}>Phone</h4>
                                        <p className="mb-0 text-light">+91 81408 31827</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="contact-form">
                                <h3 className="mb-4" style={{ color: 'var(--gold-primary)', fontFamily: 'var(--font-heading)' }}>Send a Message</h3>
                                <form>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3">
                                                <input type="text" className="form-control" id="name" placeholder="Your Name" />
                                                <label htmlFor="name">Your Name</label>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-floating mb-3">
                                                <input type="email" className="form-control" id="email" placeholder="Your Email" />
                                                <label htmlFor="email">Your Email</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <input type="text" className="form-control" id="subject" placeholder="Subject" />
                                                <label htmlFor="subject">Subject</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <textarea className="form-control" placeholder="Leave a message here" id="message" style={{ height: '150px' }}></textarea>
                                                <label htmlFor="message">Message</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button className="btn btn-gold w-100 py-3" type="submit">Send Message</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="map-container h-100">
                                <iframe className="w-100 h-100" style={{ minHeight: '400px' }}
                                    src="https://maps.google.com/maps?q=Sadar+Bazar,+Nr.+Juni+Jel,+Deesa,+Gujarat+385535,+India&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default Contact;
