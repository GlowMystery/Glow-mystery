import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, selectCartTotal, checkoutCart, clearCart } from '../features/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';

const Cart = () => {

    const items = useSelector(state => state.cart.items);
    const total = useSelector(selectCartTotal);
    const { isAuthenticated } = useSelector(state => state.auth);
    const { loading } = useSelector(state => state.cart);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleCheckout = async () => {

        if (!isAuthenticated) {
            toast.warning('Please login to proceed to checkout.');
            navigate('/login');
            return;
        }

        try {

            const orderItems = items.map(i => ({
                productId: i.productId,
                name: i.name || 'Glow Mystery Product',
                quantity: i.quantity,
                price: parseFloat(i.price)
            }));

            const totalAmount = total;

            const res = await dispatch(
                checkoutCart({ orderItems, totalAmount })
            ).unwrap();

            if (res && res.success) {

                dispatch(clearCart());
                toast.success('Payment successful.');
                navigate('/dashboard');

            } else {
                toast.error('Failed to initiate checkout.');
            }

        } catch (err) {

            console.error(err);
            toast.error(err || 'Error connecting to payment gateway.');

        }
    };

    return (
        <>
            <style>{`

.cart-section{
    padding-top:140px;
    padding-bottom:60px;
    min-height:80vh;
    background:var(--bg-dark);
}

.cart-header{
    font-family:var(--font-heading);
    color:var(--gold-light);
    margin-bottom:40px;
    border-bottom:1px solid rgba(216,166,72,0.2);
    padding-bottom:15px;
}

.cart-item{
    background:rgba(255,255,255,0.02);
    border:1px solid rgba(216,166,72,0.1);
    border-radius:8px;
    padding:20px;
    margin-bottom:20px;
    display:flex;
    align-items:center;
    gap:15px;
}

.cart-item img{
    width:100px;
    height:100px;
    object-fit:contain;
    background:rgba(255,255,255,0.05);
    border-radius:8px;
    padding:10px;
}

.cart-item-details{
    flex-grow:1;
}

.cart-item-title{
    font-family:var(--font-heading);
    color:var(--text-light);
    font-size:1.1rem;
    margin-bottom:5px;
}

.cart-item-price{
    color:var(--gold-primary);
    font-weight:600;
}

.cart-controls{
    display:flex;
    align-items:center;
    gap:12px;
    margin-top:8px;
}

.quantity-control{
    display:flex;
    align-items:center;
    background:rgba(255,255,255,0.05);
    border-radius:4px;
    padding:5px 10px;
}

.quantity-control button{
    background:transparent;
    border:none;
    color:var(--gold-primary);
}

.quantity-control input{
    background:transparent;
    border:none;
    color:#fff;
    text-align:center;
    width:40px;
}

.btn-remove{
    color:#ff4d4d;
    font-size:18px;
    background:transparent;
    border:none;
}

.btn-remove:hover{
    color:#ff1a1a;
}

.order-summary{
    background:rgba(20,20,20,0.8);
    border:1px solid rgba(216,166,72,0.3);
    border-radius:12px;
    padding:30px;
    position:sticky;
    top:100px;
}

.summary-row{
    display:flex;
    justify-content:space-between;
    margin-bottom:15px;
    color:rgba(255,255,255,0.8);
}

.summary-total{
    border-top:1px solid rgba(216,166,72,0.3);
    padding-top:15px;
    font-weight:600;
    color:var(--gold-light);
    font-size:1.2rem;
    display:flex;
    justify-content:space-between;
}

/* MOBILE */

@media (max-width:768px){

.cart-item{
    flex-direction:row;
    align-items:center;
    gap:12px;
    padding:15px;

}

.cart-item img{
    width:80px;
    height:80px;
    flex-shrink:0;
    padding:5px;
    // background:none;
    box-shadow: 0 4px 15px rgba(216, 166, 72, 0.35);    
}

.cart-item-details{
    flex:1;
    min-width:0;   /* important for text truncation */
}

.cart-item-title{
    font-size:0.9rem;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
}

.cart-item-price{
    font-size:0.9rem;
}

.cart-controls{
    display:flex;
    align-items:center;
    gap:10px;
}

.quantity-control{
    padding:3px 8px;
}

.quantity-control input{
    width:30px;
}

.order-summary{
    margin-top:30px;
    position:relative;
    top:0;
}

}

}

`}</style>

            <section className="cart-section">
                <div className="container">

                    <h2 className="cart-header">Your Shopping Cart</h2>

                    <div className="row">

                        <div className="col-lg-8">

                            {items.length === 0 ? (

                                <div className="text-center py-5">
                                    <i className="bi bi-cart-x text-white-50" style={{ fontSize: '4rem' }}></i>
                                    <h4 className="mt-3 text-white-50">Your cart is empty</h4>

                                    <Link to="/shop" className="btn btn-gold mt-4">
                                        Continue Shopping
                                    </Link>
                                </div>

                            ) : (

                                <div>

                                    {items.map((item, idx) => (

                                        <div className="cart-item" key={item.productId || idx}>

                                            <img
                                                src={item.image || '/creambg.png'}
                                                alt={item.name}
                                            />

                                            <div className="cart-item-details">

                                                <h5
                                                    className="cart-item-title"
                                                    title={item.name}
                                                >
                                                    {item.name}
                                                </h5>

                                                <p className="cart-item-price mb-2">
                                                    ₹{(parseFloat(item.price) || 0).toFixed(2)}
                                                </p>

                                                <div className="cart-controls">

                                                    <div className="quantity-control">

                                                        <button
                                                            onClick={() =>
                                                                dispatch(
                                                                    updateQuantity({
                                                                        productId: item.productId,
                                                                        quantity: Math.max(
                                                                            1,
                                                                            (parseInt(item.quantity) || 1) - 1
                                                                        )
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-dash"></i>
                                                        </button>

                                                        <input
                                                            type="text"
                                                            value={parseInt(item.quantity) || 1}
                                                            readOnly
                                                        />

                                                        <button
                                                            onClick={() =>
                                                                dispatch(
                                                                    updateQuantity({
                                                                        productId: item.productId,
                                                                        quantity: (parseInt(item.quantity) || 1) + 1
                                                                    })
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-plus"></i>
                                                        </button>

                                                    </div>

                                                    <button
                                                        className="btn-remove"
                                                        onClick={() =>
                                                            dispatch(removeFromCart(item.productId))
                                                        }
                                                    >
                                                        <i className="bi bi-trash3"></i>
                                                    </button>

                                                </div>

                                            </div>
                                        </div>

                                    ))}

                                </div>

                            )}

                        </div>

                        <div className="col-lg-4 mt-5 mt-lg-0">

                            <div
                                className="order-summary"
                                style={{ display: items.length > 0 ? 'block' : 'none' }}
                            >

                                <h4
                                    className="text-gold mb-4"
                                    style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                    Order Summary
                                </h4>

                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>₹{(parseFloat(total) || 0).toFixed(2)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>

                                <div className="summary-total mt-4">
                                    <span>Total</span>
                                    <span>₹{(parseFloat(total) || 0).toFixed(2)}</span>
                                </div>

                                {loading ? (

                                    <div className="text-center mt-4">
                                        <Loader overlay={true} />
                                    </div>

                                ) : (

                                    <button
                                        className="btn btn-gold w-100 mt-4 btn-lg"
                                        onClick={handleCheckout}
                                    >
                                        Proceed to Checkout
                                    </button>

                                )}

                            </div>

                        </div>

                    </div>
                </div>
            </section>

        </>
    );
};

export default Cart;