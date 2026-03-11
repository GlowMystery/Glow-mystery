import React from 'react';

const About = () => {
    return (
        <>
            <style>{`
        .about-page-section {
            padding-top: 15rem;
            padding-bottom: 5rem;
            min-height: 80vh;
        }
        .about-text h1 {
            font-family: var(--font-heading);
            color: var(--gold-primary);
            font-size: 3.5rem;
            margin-bottom: 1.5rem;
        }
        .about-text p {
            color: rgba(255, 255, 255, 0.8);
            font-size: 1.1rem;
            line-height: 1.8;
            margin-bottom: 1.5rem;
        }
        .about-logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
        }
        .about-logo-container img {
            max-width: 80%;
            filter: drop-shadow(0 0 20px rgba(216, 166, 72, 0.3));
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
        }
      `}</style>
            <section className="about-page-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 about-text">
                            <h1>Our Story</h1>
                            <p>
                                Welcome to Glow Mystery, where elegance meets mystery. We are dedicated to unveiling the secret
                                to radiant, timeless beauty.
                            </p>
                            <p>
                                Our journey began with a simple passion: to create skincare products that not only nourish the
                                skin but also inspire the soul. Merging nature's finest ingredients with modern innovation, we
                                offer a luxurious experience that transforms your daily routine into a ritual of self-care.
                            </p>
                            <p>
                                Every product is a mystery waiting to be revealed—a glowing testament to quality, luxury, and
                                the golden touch.
                            </p>
                            <button className="btn btn-gold mt-3">Discover More</button>
                        </div>
                        <div className="col-lg-6 mt-5 mt-lg-0">
                            <div className="about-logo-container">
                                <img src="/file.svg" alt="Glow Mystery Logo Large" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
export default About;
