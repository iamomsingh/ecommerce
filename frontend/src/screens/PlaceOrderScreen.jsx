import { useEffect } from "react";
import {Link, useNavigate} from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import {Button, Row, Col, ListGroup, Image, Card, ListGroupItem} from 'react-bootstrap';
import {toast} from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from "../components/Message";
import Loader from "../components/Loader";
import { useCreateOrderMutation } from "../slices/ordersApiSlice";
import { clearCartItems } from "../slices/cartSlice";

const PlaceOrderScreen = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const cart = useSelector(state => state.cart)
    const {cartItems,shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice} = cart;

    const [createOrder, {isLoading, error}] = useCreateOrderMutation();
    
    useEffect(() => {
        if (!shippingAddress.address) { 
            navigate('/shipping');
        } else if(!paymentMethod) {
            navigate('/payment');
        }
    }, [shippingAddress.address, paymentMethod, navigate]);

    const handleClick = async () => {
        try {
            const res = await createOrder({
                orderItems: cartItems,
                shippingAddress: shippingAddress,
                paymentMethod: paymentMethod,
                itemsPrice: itemsPrice,
                shippingPrice: shippingPrice, 
                taxPrice: taxPrice,
                totalPrice: totalPrice
            }).unwrap();

            dispatch(clearCartItems());
            navigate(`/order/${res._id}`);

        } catch (error) {
            toast.error(error);
        }
    }

  return (
    <>
        <CheckoutSteps step1 step2 step3 step4 />

        <Row>
            <Col md={8}>
                <ListGroup variant="flush">
                    <ListGroupItem>
                        <h2>Shipping</h2>
                        <p>
                            <strong>Address: </strong>
                            {shippingAddress.address}, 
                            {shippingAddress.city},
                            {shippingAddress.postalCode}, 
                            {shippingAddress.country},
                        </p>
                    </ListGroupItem>

                    <ListGroupItem>
                        <h2>Payment Method</h2>
                        <strong>Method: </strong>
                        {paymentMethod}
                    </ListGroupItem>

                    <ListGroupItem>
                        <h2>Order Items</h2>
                        {cartItems.length === 0 ? (
                            <Message>Your cart is empty </Message>
                        ) : (
                            <ListGroup variant="flush">
                                { cartItems.map((item, index) => (
                                    <ListGroupItem key={index}>
                                        <Row>
                                            <Col md={1}>
                                                <Image 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    fluid 
                                                    rounded 
                                                />
                                            </Col>
                                            <Col>
                                                <Link to={`/product/${item._id}`}>
                                                    {item.name}
                                                </Link>
                                            </Col>
                                            <Col md={4}>
                                              {item.qty} x ${item.price} = ${item.qty * item.price}
                                            </Col>
                                        </Row>
                                    </ListGroupItem>
                                ))}
                            </ListGroup>
                        )}
                    </ListGroupItem>
                </ListGroup>
            </Col>
            <Col md={4}>
                <Card>
                    <ListGroup variant="flush">
                        <ListGroupItem>
                            <h2>Order Summary</h2>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Items:</Col>
                                <Col>${itemsPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Shipping:</Col>
                                <Col>${shippingPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Tax:</Col>
                                <Col>${taxPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Total:</Col>
                                <Col>${totalPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            {error && <Message variant='danger'>{error}</Message>}
                        </ListGroupItem>

                        <ListGroupItem>
                            <Button
                            type="button"
                            className="btn-block"
                            disabled= {cartItems.length === 0}
                            onClick={() => handleClick()}
                            >
                                Place Order
                            </Button>
                            {isLoading && <Loader />}
                        </ListGroupItem>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    </>
  );
};

export default PlaceOrderScreen;


