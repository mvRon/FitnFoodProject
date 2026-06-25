import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { slugify } from '../../utils'

const TypeItem = styled.div`
  padding: 10px 22px;
  background-color: #ffffff;
  border: 1px solid rgba(148, 163, 184, 0.3); /* Slate 400 with opacity */
  border-radius: 50px; /* Pill shape */
  box-shadow: 0 4px 10px rgba(30, 41, 59, 0.04);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  color: #1E293B; /* Slate 800 */
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;

  &:hover {
    border-color: #10B981; /* Emerald Green */
    color: #10B981;
    background-color: rgba(16, 185, 129, 0.04);
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(16, 185, 129, 0.12);
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