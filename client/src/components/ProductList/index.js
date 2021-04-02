import React, { useEffect } from "react";
import { useQuery } from '@apollo/react-hooks';
import store from "../../utils/store";
import { useDispatch } from 'react-redux';
import { UPDATE_PRODUCTS } from '../../utils/actions';
import ProductItem from "../ProductItem";
import { QUERY_PRODUCTS } from "../../utils/queries";
import spinner from "../../assets/spinner.gif";
import { idbPromise } from '../../utils/helpers';

function ProductList() {
  const state = store.getState();
  const dispatch = useDispatch();

  const { currentCategory } = state;

  const { loading, data } = useQuery(QUERY_PRODUCTS);

  useEffect(() => {
    // If there is data to be stored
    if (data) {
      // let's store it in the global state object
      dispatch({
        type: UPDATE_PRODUCTS,
        products: data.products
      });

      // But let's also take each product and save it to IndexedDB using the helper function
      data.products.forEach((product) => {
        idbPromise('products', 'put', product);
      });
      // Add else if to check if 'loading' is undefined in 'useQuery()' Hook
    } else if (!loading) {
      // Since we're offline, get all of the data from the 'products' store
      idbPromise('products', 'get').then((products) => {
        // Use retrieved data to set global state for offline browsing
        dispatch({
          type: UPDATE_PRODUCTS,
          products: products
        });
      });
    }
  }, [data, loading, dispatch]);

  function filterProducts() {
    if (!currentCategory) {
      return state.products;
    }

    return state.products.filter(product => product.category._id === currentCategory);
  }

  return (
    <div className="my-2">
      <h2>Our Products:</h2>
      {state.products.length ? (
        <div className="flex-row">
            {filterProducts().map(product => (
                <ProductItem
                  key= {product._id}
                  _id={product._id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  quantity={product.quantity}
                />
            ))}
        </div>
      ) : (
        <h3>You haven't added any products yet!</h3>
      )}
      { loading ? 
      <img src={spinner} alt="loading" />: null}
    </div>
  );
}

export default ProductList;