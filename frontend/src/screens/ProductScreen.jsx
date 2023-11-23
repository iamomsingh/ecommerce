import { useState } from 'react';
// import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Image, ListGroup, ListGroupItem, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import {toast } from 'react-toastify';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useGetProductDetailsQuery, useCreateReviewMutation } from '../slices/productsApiSlice';
import { addToCart } from '../slices/cartSlice';
import Meta from '../components/Meta';



const ProductScreen = () => {
    // const [product, setProduct] = useState({});
    const { id: ProductId } = useParams();

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    // useEffect(() => {
    //         const fetchProducts = async () => {
    //             const {data} = await axios.get(`/api/products/${ProductId}`);
    //             setProduct(data);
    //         }
    //         fetchProducts();
    // }, [ProductId]);

    // console.log(product);

    const {data: product, isLoading , error, refetch} = useGetProductDetailsQuery(ProductId);

    const [createReview, { isLoading: loadingProductReview} ] = useCreateReviewMutation();

    const { userInfo } = useSelector(state => state.auth);

    const addToCartHandler = () => {
        dispatch(addToCart({ ...product, qty}));
        navigate('/cart');
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await createReview({
                ProductId,
                rating,
                comment
            }).unwrap();
            refetch();
            toast.success('Review Submitted');
            setRating(0);
            setComment('');
        } catch (err) {
            toast.error(err?.data?.message || err.error);
        }
    };

  return (
   <>
    <Link className='btn btn-light my-3 p-2' to='/'>Go BAck</Link>

    {isLoading ? (
       <Loader />
    ) : error ? (
        <Message variant='danger'>{<div>{error?.data?.message || error.error}</div>}</Message>
    ) : (
        <>
        <Meta title={product.name} />
        <Row>
        <Col md={6} className='w-4 h-400'>
            <Image  src={product.image} alt={product.name} />  
        </Col>
        <Col md={3}>
            <ListGroup variant='flush'>
                <ListGroupItem>
                    <h3>{product.name}</h3>
                </ListGroupItem>
                <ListGroupItem>
                    <Rating value={product.rating} text={`${product.numReviews} reviews`} />
                </ListGroupItem>
                <ListGroupItem>
                    Price: ${product.price}
                </ListGroupItem>
                <ListGroupItem>
                    Description: {product.description}
                </ListGroupItem>
            </ListGroup>
        </Col>
        <Col md={3}>
            <Card>
                <ListGroup variant='flush'>
                    <ListGroupItem>
                        <Row>
                            <Col>Price:</Col>
                            <Col><strong>${product.price}</strong></Col>
                        </Row>
                    </ListGroupItem>
                    <ListGroupItem>
                        <Row>
                            <Col>Status:</Col>
                            <Col><strong>${product.countInStock > 0 ? 'In Stock' : 'Out Of Stock' }</strong></Col>
                        </Row>
                    </ListGroupItem>
                    {product.countInStock > 0 && (
                        <ListGroupItem>
                            <Row>
                                <Col>Qty</Col>
                                <Col>
                                <Form.Control
                                as='select'
                                value={qty}
                                onChange={e => setQty(Number(e.target.value))}
                                >
                                    {[...Array(product.countInStock).keys()].map(x => (
                                        <option key={x+1} value={x+1}>
                                            {x+1}
                                        </option>
                                    ))}
                                </Form.Control>
                                </Col>
                            </Row>
                        </ListGroupItem>
                    )}
                    <ListGroup>
                        <Button
                        className='btn-block'
                        type='button'
                        disabled={product.countInStock === 0}
                        onClick={addToCartHandler}
                        >
                            Add To Cart
                        </Button>
                    </ListGroup>
                </ListGroup>
            </Card>
        
        </Col>
    </Row>
    <Row className='review'>
        <Col md={6}>
            <h2>Reviews</h2>
            {product.reviews.length === 0 && <Message>No Reviews</Message>}
            <ListGroup variant='flush'>
                {product.reviews.map(review => (
                    <ListGroupItem key={review._id}>
                        <strong>{review.name}</strong>
                        <Rating value={review.rating}></Rating>
                        <p>{review.createdAt.substring(0, 10)}</p>
                        <p>{review.comment} </p>
                    </ListGroupItem>
                ))}
                <ListGroupItem>
                    <h2>Write a Customer Reviews</h2>

                    {loadingProductReview && <Loader />}

                    {userInfo ? (
                        <Form onSubmit={ submitHandler}>
                            <Form.Group controlId='rating' className='my-2'>
                                <Form.Label>Rating</Form.Label>
                                <Form.Control
                                as= 'select'
                                value={rating}
                                onChange={e => setRating(Number(e.target.value))}
                                >
                                    <option value=''>Select...</option>
                                    <option value='1'>1 - Poor</option>
                                    <option value='2'>2 - Fair</option>
                                    <option value='3'>3 - Good</option>
                                    <option value='4'>4 - Very Good</option>
                                    <option value='5'>5 - Excellent</option>
                                </Form.Control>
                            </Form.Group>

                            <Form.Group controlId='comment' className='my-2'>
                                <Form.Label>Comment</Form.Label>
                                <Form.Control
                                as= 'textarea'
                                rows= '2'
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                >
                                
                                </Form.Control>
                            </Form.Group>
                            <Button
                            disabled={loadingProductReview}
                            type='submit'
                            variant='primary'>
                                Submit
                            </Button>
                        </Form>
                    ) : (
                        <Message>
                            please <Link to= '/login'>sign in</Link> to write a review{' '}
                        </Message>
                    )}
                </ListGroupItem>
            </ListGroup>
        </Col>
    </Row>
        </>
    )}
    

   </>
  )
}

export default ProductScreen