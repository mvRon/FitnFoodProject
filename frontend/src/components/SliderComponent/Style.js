import Slider from "react-slick";
import styled from "styled-components";

export const WrapperSliderStyle = styled(Slider)`
    width: 100%;

    & .slick-list {
        overflow: hidden;
        border-radius: 8px;
    }

    & .slick-track {
        display: flex !important;
        align-items: center;
    }

    & .slick-slide > div {
        width: 100%;
    }

    & .slick-arrow.slick-prev {
        left: 12px;
        top: 50%;
        z-index: 10;
        &::before {
            font-size: 40px;
            color: #fff;
        }
    }
    
    & .slick-arrow.slick-next {
        right: 28px;
        top: 50%;
        z-index: 10;
        &::before {
            font-size: 40px;
            color: #fff;
        }
    }

    & .slick-dots {
        z-index: 10;
        bottom: -2px !important;
        li {
            button {
                &::before {
                    color: rgb(255, 255, 0.5);
                }
            }
        }

        li.slick-active {
            button {
                &::before {
                    color: #fff;
                }
            }
        }
    }
`