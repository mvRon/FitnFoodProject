import { Image } from 'antd';
import React from 'react'
import Slider from 'react-slick';
import { WrapperSliderStyle } from './Style';

const SliderComponent = ({ arrImages, selectedImage }) => {

    const safeImages = Array.isArray(arrImages) ? arrImages.filter(Boolean) : [];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    const imagesToDisplay = selectedImage
        ? [selectedImage, ...safeImages.filter((image) => image !== selectedImage)]
        : safeImages;

    return (
        <WrapperSliderStyle {...settings} style={{
            width: '100%',
            minHeight: 320,
            maxWidth: '1920px',
            overflow: 'hidden',
            borderRadius: 8
        }}>
            {imagesToDisplay.map((image) => (
                <Image
                    key={image}
                    src={image}
                    alt='Slider'
                    preview={false}
                    width='100%'
                    height={420}
                    style={{
                        objectFit: 'contain',
                    }}
                />
            ))}
        </WrapperSliderStyle>
    )
}

export default SliderComponent