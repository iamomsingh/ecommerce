// import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import {Link, useParams} from 'react-router-dom';
import Product from '../components/Product';
// import axios from 'axios';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';

const HomeScreen = () => {
  // const [products, setProducts] = useState([]);

  // useEffect(() => {
  //   const fetchProducts = async () => {
  //     const {data} = await axios.get('/api/products');
  //     setProducts(data);
  //   };

  //   fetchProducts();
  // }, []);

  const {pageNumber, keyword} = useParams();
  const {data, isLoading, error}= useGetProductsQuery({keyword, pageNumber });

  return (
    <>
    { !keyword ? (
    <ProductCarousel /> 
    ) : (
      <Link to= '/' className='btn btn-light mb-4'>
        Go Back
      </Link>
    )}
    {isLoading ? (
     <Loader />
    ) : error ? (
      <Message variant='danger'>{<div>{error?.data?.message || error.error}</div>}</Message>
      
    ) : (
      <>
      <h1>Latest Products</h1>
      <Row>
      
        {data.products.map(product => (
            <Col key = {product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
            </Col>
        ))}
      </Row>
      <Paginate pages={data.pages} page={data.page} keyword= {keyword ? keyword : ''}/>
      </>
    )}
  
    </>
  )
}

export default HomeScreen