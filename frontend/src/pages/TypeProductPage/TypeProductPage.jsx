import React, { useEffect, useState } from 'react'
import CardComponent from '../../components/CardComponent/CardComponent'
import { Breadcrumb, Spin } from 'antd'
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
    WrapperButtonMore,
} from './Style'
import { useQuery } from '@tanstack/react-query'
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
    const [displayProducts, setDisplayProducts] = useState([])
    const [page, setPage] = useState(1)
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

    const isSearching = Boolean(searchDebounce);

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

    const fetchProducts = async (typeId, keyword, currentPage) => {
        if (!typeId) return { data: [], total: 0 };
        if (keyword) {
            return await ProductService.searchProducts(keyword, {
                limit: 12,
                page: currentPage,
                includeImages: true,
                typeId,
            });
        }
        return await ProductService.getProductByType(typeId, currentPage, 12);
    };

    const { data: productsData, isPending, isFetching } = useQuery({
        queryKey: ['products-by-type', currentCategoryId, searchDebounce, page],
        queryFn: () => fetchProducts(currentCategoryId, searchDebounce, page),
        enabled: Boolean(currentCategoryId),
        retry: 3,
        retryDelay: 1000,
    });

    const isloading = isPending && page === 1;
    const isLoadingMore = isFetching && page > 1;

    useEffect(() => {
        setPage(1);
        setDisplayProducts([]);
    }, [currentCategoryId, searchDebounce]);

    useEffect(() => {
        if (!productsData?.data) return;

        if (page === 1) {
            setDisplayProducts(productsData.data);
            return;
        }

        setDisplayProducts((prev) => {
            const productMap = new Map(prev.map((item) => [item._id, item]));
            productsData.data.forEach((item) => {
                productMap.set(item._id, item);
            });
            return Array.from(productMap.values());
        });
    }, [productsData, page]);

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
                                {totalCategoryCount} danh mục liên quan • {productsData?.total || 0} sản phẩm
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
                                {displayProducts.length > 0 ? displayProducts?.map((product) => (
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
                                <WrapperButtonMore
                                    disabled={!productsData?.total || displayProducts.length >= productsData.total || isFetching}
                                    onClick={() => setPage((prev) => prev + 1)}
                                >
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                        {isLoadingMore && <Spin size="small" />}
                                        <span>{isLoadingMore ? 'Đang tải thêm' : 'Xem thêm'}</span>
                                    </span>
                                </WrapperButtonMore>
                            </PaginationWrap>
                        </ProductsPanel>
                    </ContentContainer>
                </PageBody>
            </LoadingComponent>
        </PageRoot>
    )
}

export default TypeProductPage