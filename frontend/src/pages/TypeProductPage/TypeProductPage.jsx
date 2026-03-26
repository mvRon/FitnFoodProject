import React, { useEffect, useState } from 'react'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Breadcrumb, Pagination } from 'antd'
import {
    BreadcrumbWrap,
    CategoryBar,
    CategoryScroller,
    ChildCategory,
    ContentContainer,
    EmptyDescription,
    EmptyState,
    EmptyTitle,
    HeroCard,
    HeroMeta,
    HeroTitle,
    PageBody,
    PageRoot,
    PaginationWrap,
    ParentCategory,
    ProductsPanel,
    WrapperProducts,
} from './Style'
import { useLocation, useNavigate } from 'react-router-dom'
import * as ProductService from '../../services/ProductService'
import * as CategoryService from '../../services/CategoryService'
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent'
import { useSelector } from 'react-redux'
import { useDebounce } from '../../hooks/useDebounce'
import { slugify } from '../../utils'

const getIdFromPath = (pathname) => {
    const lastPart = pathname.split('/').pop();
    const id = lastPart.split('-').pop();
    return id;
};

const TypeProductPage = () => {
    const searchProduct = useSelector((state) => state?.product?.search)
    const searchDebounce = useDebounce(searchProduct, 500)
    const location = useLocation()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [isloading, setIsLoading] = useState(false)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
    })
    const [typeProduct, setTypeProduct] = useState([])
    const [selectedChildId, setSelectedChildId] = useState(null);

    const currentCategoryId = getIdFromPath(location.pathname);
    const currentCategory = typeProduct.find(cat => cat._id === currentCategoryId);

    const parentId = currentCategory?.parent
        ? (typeof currentCategory.parent === 'object'
            ? currentCategory.parent._id
            : currentCategory.parent)
        : currentCategory?._id;

    // Lấy danh mục cha cấp 1.
    const topLevelCategories = typeProduct.filter(cat => !cat.parent);

    // Nếu có currentCategory thì lấy các danh mục cùng cha
    const siblingCategories = currentCategory
        ? typeProduct
            .filter(
                (item) =>
                    (item.parent
                        ? (typeof item.parent === 'object'
                            ? item.parent._id
                            : item.parent)
                        : item._id) === parentId
            )
            .sort((a, b) => (a._id === parentId ? -1 : b._id === parentId ? 1 : 0)) // Cha nổi bật lên đầu
        : [];

    const productAfterSearch = products?.filter((pro) => {
        if (searchDebounce === '') return pro;
        return pro?.name?.toLowerCase().includes(searchDebounce?.toLocaleLowerCase());
    });

    const fetchAllTypeProduct = async () => {
        const res = await CategoryService.getAllCategories();
        if (res?.status === 'OK') {
            setTypeProduct(res.data || []);
        }
        return res;
    }

    useEffect(() => {
        fetchAllTypeProduct()
    }, [])

    useEffect(() => {
        if (!currentCategory) return
        const hasParent = Boolean(currentCategory.parent)
        setSelectedChildId(hasParent ? currentCategory._id : null)
    }, [currentCategory])

    const fetchProductByType = async (typeId, page, limit) => {
        setIsLoading(true)
        const res = await ProductService.getProductByType(typeId, page, limit)
        if (res?.status === 'OK') {
            setIsLoading(false)
            setProducts(res?.data)
            setPagination((prev) => ({ ...prev, total: res?.total || 0 }))
        } else {
            setIsLoading(false)
            setProducts([])
        }
        return res
    }

    useEffect(() => {
        if (currentCategoryId) {
            fetchProductByType(currentCategoryId, pagination?.page, pagination?.limit)
        }
    }, [currentCategoryId, pagination?.page, pagination?.limit])

    useEffect(() => {
        setPagination((prev) => ({ ...prev, page: 1 }))
    }, [currentCategoryId])

    const onChange = (current, pageSize) => {
        setPagination((prev) => ({ ...prev, page: current, limit: pageSize }))
    }

    if (!typeProduct.length) return <div>Loading...</div>;

    const getCategoryPath = (category, allCategories) => {
        const path = [];
        let current = category;
        while (current) {
            path.unshift(current);
            if (!current.parent) break;
            current = allCategories.find(
                (cat) =>
                    (typeof current.parent === 'object'
                        ? current.parent._id
                        : current.parent) === cat._id
            );
        }
        return path;
    };

    const handleNavigateHome = () => {
        navigate('/');
    };

    const handleNavigateCategory = (cat) => {
        navigate(`/product/${slugify(cat.name)}-${cat._id}`, { state: cat._id });
        // Nếu là category con thì set selectedChildId
        if (cat.parent) setSelectedChildId(cat._id);
        else setSelectedChildId(null);
    };

    const categoryPath = currentCategory ? getCategoryPath(currentCategory, typeProduct) : [];
    const totalCategoryCount = currentCategory
        ? siblingCategories.length
        : topLevelCategories.length

    return (
        <PageRoot>
            <LoadingComponent isPending={isloading}>
                <BreadcrumbWrap>
                    <Breadcrumb>
                        <Breadcrumb.Item onClick={handleNavigateHome}>Trang chủ</Breadcrumb.Item>
                        {categoryPath.map((cat) => (
                            <Breadcrumb.Item
                                key={cat._id}
                                onClick={() => handleNavigateCategory(cat)}
                            >
                                {cat.name}
                            </Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                </BreadcrumbWrap>

                <PageBody>
                    <ContentContainer>
                        <HeroCard>
                            <HeroTitle>
                                {currentCategory ? currentCategory.name : 'Khám phá danh mục thực phẩm'}
                            </HeroTitle>
                            <HeroMeta>
                                {totalCategoryCount} danh mục liên quan • {pagination.total} sản phẩm
                            </HeroMeta>
                            <HeroMeta>
                                Bộ lọc thông minh theo nhóm thực phẩm giúp bạn chọn nhanh theo mục tiêu dinh dưỡng.
                            </HeroMeta>
                        </HeroCard>

                        <CategoryBar>
                            <CategoryScroller>
                                {!currentCategory && topLevelCategories.map((cat) => (
                                    <ParentCategory key={cat._id} onClick={() => handleNavigateCategory(cat)}>
                                        {cat.name}
                                    </ParentCategory>
                                ))}

                                {currentCategory && siblingCategories.map((item) => {
                                    const isParent = item._id === parentId;
                                    const isSelectedChild = selectedChildId === item._id;

                                    if (isParent) {
                                        return (
                                            <ParentCategory key={item._id} onClick={() => handleNavigateCategory(item)}>
                                                {item.name}
                                            </ParentCategory>
                                        )
                                    }

                                    return (
                                        <ChildCategory
                                            key={item._id}
                                            $active={isSelectedChild}
                                            onClick={() => handleNavigateCategory(item)}
                                        >
                                            {item.name}
                                        </ChildCategory>
                                    )
                                })}
                            </CategoryScroller>
                        </CategoryBar>

                        <ProductsPanel>
                            <WrapperProducts>
                                {productAfterSearch.length > 0 ? productAfterSearch?.map((product) => (
                                    <CardComponent
                                        key={product?._id}
                                        countInStock={product.countInStock}
                                        description={product.description}
                                        image={product.images?.[0]}
                                        name={product.name}
                                        price={product.price}
                                        rating={product.rating}
                                        type={product.type}
                                        sold={product.sold}
                                        discount={product.discount}
                                        id={product?._id}
                                    />
                                )) : (
                                    <EmptyState>
                                        <EmptyTitle>Không tìm thấy sản phẩm phù hợp</EmptyTitle>
                                        <EmptyDescription>Thử từ khóa khác hoặc chọn nhóm danh mục khác để có thêm gợi ý.</EmptyDescription>
                                    </EmptyState>
                                )}
                            </WrapperProducts>

                            <PaginationWrap>
                                <Pagination
                                    current={pagination.page}
                                    pageSize={pagination.limit}
                                    total={pagination.total}
                                    onChange={onChange}
                                    showSizeChanger
                                    pageSizeOptions={['8', '12', '16', '20']}
                                />
                            </PaginationWrap>
                        </ProductsPanel>
                    </ContentContainer>
                </PageBody>
            </LoadingComponent>
        </PageRoot>
    )
}

export default TypeProductPage