import React from 'react'
import { StyledLogo, StyleNameProduct, WrapperCardStyle, WrapperDiscountText, WrapperPriceText, WrapperReportText, WrapperStyleTextSell } from './Style';
import { StarFilled } from '@ant-design/icons';
import { Image, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom'
import { convertPrice } from '../../utils'
import testIMG from '../../assets/kjw1.jpeg'

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
            cover={<img alt="example" src={testIMG} />}
            onClick={() => countInStock !== 0 && handleDetailProduct(id)}
            disabled={countInStock === 0}
        >

            <div>
                <StyledLogo src={testIMG} preview={false} />
                <StyleNameProduct>{name || 'Demo'}</StyleNameProduct>
            </div>
            <div>
                <WrapperReportText>
                    <span style={{ marginRight: '4px' }}>
                        <span>{(typeof rating === 'number' ? rating.toFixed(1).replace('.', ',') : (Number.parseFloat(rating)?.toFixed(1).replace('.', ',') || '2,0'))} </span> {<StarFilled style={{ fontSize: '12px', color: 'yellow' }} />}
                    </span>
                    <WrapperStyleTextSell> | Đã bán {sold || 5}</WrapperStyleTextSell>
                </WrapperReportText>
                <WrapperPriceText>
                    <Text delete style={{ marginRight: '8px' }}>{convertPrice(price) || 100000}</Text>
                    <Text style={{ marginRight: '8px', color: 'red' }}>{convertPrice(priceAfterDiscount) || 100000} <WrapperDiscountText>- {discount || 5}%</WrapperDiscountText></Text>
                </WrapperPriceText>
            </div>
        </WrapperCardStyle>
    )
}

export default CardComponent