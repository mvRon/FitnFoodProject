import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { slugify } from '../../utils'

const TypeItem = styled.div`
  padding: 12px 16px;
  margin-bottom: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  font-weight: 500;
  color: #333;
  user-select: none;

  &:hover {
    background-color: #f5f5f5;
    transform: translateY(-2px);
  }
`

const TypeProduct = ({ name, _id, onClick }) => {
  const navigate = useNavigate()

  const handleNavigateType = () => {
    if (onClick) return onClick();
    navigate(`/product/${slugify(name)}-${_id}`, { state: _id })
  }

  return <TypeItem onClick={handleNavigateType}>{name}</TypeItem>
}

export default TypeProduct