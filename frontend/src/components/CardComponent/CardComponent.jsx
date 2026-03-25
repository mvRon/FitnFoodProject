import React from 'react'
import { OriginalPriceText, RatingValueText, SalePriceText, StyledLogo, StyledRatingStar, StyleNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperPriceText, WrapperReportText, WrapperStyleTextSell } from './Style';
import { StarFilled } from '@ant-design/icons';
import { Image, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom'
import { convertPrice } from '../../utils'
// import testIMG from '../../assets/kjw1.jpeg'

const { Title, Text } = Typography;
const CardComponent = (props) => {

    const { countInStock, description, image, name, price, rating, type, discount, sold, id } = props

    const navigate = useNavigate()

    const handleDetailProduct = (id) => {
        navigate(`/productDetail/${id}`)
    }

    const priceAfterDiscount = price - (price * (discount / 100))
    return (
        <WrapperCardStyle
            hoverable
            styles={{
                header: { width: '200px', height: '200px' },
                body: { padding: '10px' }
            }}
            cover={<img alt="example" src={image} />}
            onClick={() => countInStock !== 0 && handleDetailProduct(id)}
            disabled={countInStock === 0}
        >

            <div>
                <StyledLogo src={image} preview={false} />
                <StyleNameProduct>{name || 'Demo'}</StyleNameProduct>
            </div>
            <div>
                <WrapperReportText>
                    <span style={{ marginRight: '4px' }}>
                        <RatingValueText>{(typeof rating === 'number' ? rating.toFixed(1).replace('.', ',') : (Number.parseFloat(rating)?.toFixed(1).replace('.', ',') || '2,0'))} </RatingValueText>
                        {<StyledRatingStar><StarFilled /></StyledRatingStar>}
                    </span>
                    <WrapperStyleTextSell> | Đã bán {sold || 5}</WrapperStyleTextSell>
                </WrapperReportText>
                <WrapperPriceText>
                    <OriginalPriceText><Text delete>{convertPrice(price) || 100000}</Text></OriginalPriceText>
                    <SalePriceText>{convertPrice(priceAfterDiscount) || 100000} <WrapperDiscountText>- {discount || 5}%</WrapperDiscountText></SalePriceText>
                </WrapperPriceText>
            </div>
        </WrapperCardStyle>
    )
}

export default CardComponent