import React, { useEffect, useState } from 'react'
import CardComponent from '../../components/CardComponent/CardComponent.jsx';
import { WrapperButtonMore, WrapperProducts, WrapperTypeProduct } from './Style.js'

import TypeProduct from '../../components/TypeProduct/TypeProduct.jsx'
// import { Button } from 'antd';
import { useDebounce } from "../../hooks/useDebounce";
import { useSelector } from "react-redux";
import * as ProductService from '../../services/ProductService.js'
import * as CategoryService from '../../services/CategoryService.js'

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent.jsx'
import { Breadcrumb } from 'antd';

import { useLocation, useNavigate } from 'react-router-dom';
import { slugify } from '../../utils';


const HomePage = () => {

  // const [typeProduct, setTypeProduct] = useState(['Máy giặt', 'Tivi', 'Tủ lạnh'])

  const searchProduct = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(searchProduct, 500)
  const [limit, setLimit] = useState(5)
  const [typeProduct, setTypeProduct] = useState([])
  const [slide, setSlide] = useState([])

  const fetchProductAll = async (search) => {
    const res = await ProductService.getAllProduct(search, limit)
    return res
  }



  const fetchAllTypeProduct = async () => {
    // const res = await ProductService.getAllTypeProduct()
    const res = await CategoryService.getAllCategories();
    setTypeProduct(res?.data)
    return res
  }

  useEffect(() => {
    fetchAllTypeProduct()
  }, [])


  const { data: products, isPending, isPlaceholderData } = useQuery({
    queryKey: ['products', searchDebounce, limit],
    queryFn: () => fetchProductAll(searchDebounce),
    retry: 3,
    retryDelay: 1000,
    placeholderData: keepPreviousData,
  });

  // console.log('products', products)
  //Chỉ lọc ra những Category cha
  const parentCategories = typeProduct.filter(item => !item.parent);

  // console.log('products', products?.data?.length)

  const navigate = useNavigate();

  return (
    <div>
      <LoadingComponent isPending={isPending}>
        <div style={{ maxWidth: '1270px', width: '100%', margin: '0 auto', padding: '0 16px' }}>
          <Breadcrumb style={{ background: 'transparent', padding: 0, marginBottom: 12 }}>
            <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
          </Breadcrumb>
        </div>
        <div className="body" style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.08), rgba(2,132,199,0.06) 35%, rgba(248,250,252,0.9) 100%)', width: '100%' }}>
          <div id="container" style={{ maxWidth: '1270px', width: '100%', margin: '0 auto', padding: '0 16px' }}>
            <div
              style={{
                marginTop: 10,
                marginBottom: 14,
                background: 'linear-gradient(120deg, #10B981 0%, #0284C7 65%)',
                borderRadius: 24,
                padding: '20px 24px',
                boxShadow: '0 20px 45px rgba(2,132,199,0.24)',
                color: '#fff',
              }}
            >
              <h2 style={{ margin: 0, fontSize: 30, lineHeight: 1.2, fontWeight: 800 }}>
                Eat Clean, Live Smart
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.95 }}>
                Chọn thực phẩm lành mạnh theo nhu cầu dinh dưỡng, giao nhanh và luôn tươi mới mỗi ngày.
              </p>
            </div>
            <WrapperProducts style={{ marginTop: '20px' }}>
              <div style={{ maxWidth: '1270px', width: '100%', margin: '0 auto', padding: '0 6px' }}>
                <div className="typeproduct-horizontal-scroll" style={{ overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', paddingBottom: 8 }}>
                  <WrapperTypeProduct>
                    {parentCategories.map((item) => (
                      <div key={item._id} style={{ display: 'inline-block', marginRight: 10, verticalAlign: 'top' }}>
                        <TypeProduct
                          name={item.name}
                          _id={item._id}
                          onClick={() => navigate(`/product/${slugify(item.name)}-${item._id}`, { state: item._id })}
                        />
                      </div>
                    ))}
                  </WrapperTypeProduct>
                </div>
              </div>
              {products?.data?.length > 0 ? products?.data?.map((product) => {
                return <CardComponent
                  key={product?._id}
                  countInStock={product.countInStock}
                  description={product.description}
                  image={product.images?.[0]}
                  name={product.name}
                  price={product.price}
                  rating={Number.parseFloat(product.averageRating) || product.rating}
                  type={product.type}
                  sold={product.sold}
                  discount={product.discount}
                  id={product?._id}
                />
              }) : (
                <div style={{ width: '100%', textAlign: 'center', marginTop: '20px' }}>
                  <h3>Không có sản phẩm nào phù hợp với tìm kiếm của bạn</h3>
                </div>
              )}
            </WrapperProducts>
            <div style={{ width: '100%', display: 'flex', marginTop: '10px', justifyContent: 'center' }}>
              <WrapperButtonMore
                disabled={products?.total === products?.data?.length || products?.totalPage === 1}
                onClick={() => setLimit((prev) => prev + 6)}>
                <span>{isPlaceholderData ? 'Đang tải' : 'Xem thêm'}</span>
              </WrapperButtonMore>
            </div>




          </div>
        </div>
      </LoadingComponent>
    </div>
  )
};

export default HomePage;