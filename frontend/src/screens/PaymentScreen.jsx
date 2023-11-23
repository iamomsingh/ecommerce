import {useState, useEffect} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Col, FormGroup, FormLabel, FormCheck } from 'react-bootstrap';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import { savePaymentMethod } from '../slices/cartSlice';


const PaymentScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const cart = useSelector(state => state.cart);
    const { shippingAddress } = cart;

    useEffect(() => {
        if(!shippingAddress) {
            navigate('/shipping');
        }
    }, [shippingAddress, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(savePaymentMethod(paymentMethod));
        navigate('/placeorder');
    }

    const [paymentMethod, setPaymentMethod] = useState('paypal');
  return (
    <FormContainer>
        <CheckoutSteps step1 step2 step3 />
        <h1>Payment Method</h1>

        <Form onSubmit={handleSubmit}>
            <FormGroup>
                <FormLabel as='legend'>select Method</FormLabel>
                <Col>
                <FormCheck
                type='radio'
                className='my-2'
                label='Paypal or Credit Card'
                id='paypal'
                name='paymentMethod'
                value='paypal'
                checked
                onChange={e => setPaymentMethod(e.target.value)}
                >
                </FormCheck>

                <FormCheck
                type='radio'
                className='my-2'
                label='Gpay or PhonePay or Paytm'
                id='UPI'
                name='paymentMethod'
                value='UPI'
                
                onChange={e => setPaymentMethod(e.target.value)}
                >
                </FormCheck>
                
                </Col>
            </FormGroup>
            <Button type='submit' variant='primary'>continue</Button>
        </Form>
    </FormContainer>
  )
}

export default PaymentScreen;