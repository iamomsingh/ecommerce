import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button,ListGroup,Row, Col, Image, Card, ListGroupItem, } from "react-bootstrap";
import {toast} from 'react-toastify';
import { useSelector } from "react-redux";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { 
  useGetOrderDetailsQuery, 
  usePayOrderMutation,
  useGetPayPalClientIdQuery,
  useDeliverOrderMutation 
} from "../slices/ordersApiSlice";


const OrderScreen = () => {
    const {id: orderId } = useParams();

    const {data: order,refetch, isLoading, error,  } = useGetOrderDetailsQuery(orderId);
    
    const [deliverOrder, {isLOading: loadingDeliver}] = useDeliverOrderMutation();

    const [payOrder, {isLoading: loadingPay}] = usePayOrderMutation();
    const { data: paypal, isLoading: loadingPayPal, error: errorPayPal} = useGetPayPalClientIdQuery();

    const [{isPending}, paypalDispatch] = usePayPalScriptReducer();

    const {userInfo} = useSelector(state => state.auth);

    useEffect(() => {
      if (!errorPayPal && !loadingPayPal && paypal.clientId) {
        const loadPayPalScript = async () => {
          paypalDispatch({
            type: 'resetOptions',
            value: {
              'client-id': paypal.clientId,
              currency: 'USD',
            }
          });
          paypalDispatch({type: 'setLoadingStatus', value: 'pending'});
        }
        if(order && !order.isPaid) {
          if(!window.paypal) {
            loadPayPalScript();
          }
        }
      }
    }, [order,paypal,paypalDispatch, loadingPayPal, errorPayPal]);


    function onApprove(data, actions) {
      return actions.order.capture().then(async function (details) {
        try {
          await payOrder({ orderId, details });
          refetch();
          toast.success('Order is paid');
        } catch (err) {
          toast.error(err?.data?.message || err.error);
        }
      });
    }

     // TESTING ONLY! REMOVE BEFORE PRODUCTION
  async function onApproveTest() {
    await payOrder({ orderId, details: { payer: {} } });
    refetch();

    toast.success('Payment Successful');
  }

    function onError(err) {
      toast.error(err.message);
    }

    function createOrder(data, actions) {
      return actions.order
        .create({
          purchase_units: [
            {
              amount: { value: order.totalPrice },
            },
          ],
        })
        .then((orderID) => {
          return orderID;
        });
    }

    const deliverHandler = async () => {
      try {
        await deliverOrder(orderId);
        refetch();
        toast.success('Ordere delivered');
      } catch (err) {
        toast.error(err?.data?.message || err.message);
      }
     
    };

  return (
    isLoading ? <Loader /> : error ? <Message variant= 'danger' /> : (
      <>
        <h1> Order {order._id}</h1>
        <Row>
          <Col md={8}>
              <ListGroup variant="flush">
                <ListGroupItem>
                  <h2>Shipping</h2>
                  <p>
                    <strong>Name:</strong>{order.user.name}
                  </p>
                  <p>
                    <strong>Email:</strong>{order.user.email}
                  </p>
                  <p>
                    <strong>Address:</strong>
                    {order.shippingAddress.address},
                    {order.shippingAddress.city},
                    {order.shippingAddress.postalCode},
                    {order.shippingAddress.country},
                  </p>
                  {order.isDelivered ? (
                    <Message variant='success'>
                      Delivered on  {order.deliveredAt}
                    </Message>
                  ) : (
                    <Message variant='danger'>Not Delivered</Message>
                  )}
                </ListGroupItem>

                <ListGroupItem>
                  <h2>Payment Method</h2>
                  <p>
                    <strong>Method: {order.paymentMethod}</strong>
                  </p>
                  {order.isPaid ? (
                    <Message variant={order.success}>
                      Paid on {order.paidAt}
                    </Message>
                  ) : (
                    <Message variant='danger'>Not Paid</Message>
                  )}
                </ListGroupItem>

                <ListGroupItem>
                  <h2>Order Items</h2>
                  {order.orderItems.map((item,index) => (
                    <ListGroupItem key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item._id}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>

                    </ListGroupItem>
                  ))}
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
                                <Col>${order.itemsPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Shipping:</Col>
                                <Col>${order.shippingPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Tax:</Col>
                                <Col>${order.taxPrice}</Col>
                            </Row>
                        </ListGroupItem>

                        <ListGroupItem>
                            <Row>
                                <Col>Total:</Col>
                                <Col>${order.totalPrice}</Col>
                            </Row>
                        </ListGroupItem>
                        {/* Pay ORER PLACEHOLDER*/}

                        {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}

                  {isPending ? (
                    <Loader />
                  ) : (
                    <div>
                      {/* THIS BUTTON IS FOR TESTING! REMOVE BEFORE PRODUCTION! */}
                      <Button
                        style={{ marginBottom: '10px' }}
                        onClick={onApproveTest}
                      >
                        Test Pay Order
                      </Button>

                      <div>
                        <PayPalButtons
                          createOrder= { createOrder }
                          onApprove= { onApprove }
                          onError= { onError }
                        ></PayPalButtons>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              )}
                {/*MARK AS DELIVERED PLACEHOLDER*/}
                {loadingDeliver && <Loader />}

                {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                  <ListGroupItem>
                    <Button type="button" className="btn btn-block" onClick={deliverHandler}></Button>
                  </ListGroupItem>
                )}

                        
            </ListGroup>
            </Card>
          
          </Col>
        </Row>
      </>
    )
  )
}

export default OrderScreen;