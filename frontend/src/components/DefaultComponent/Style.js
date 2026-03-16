import styled from 'styled-components'

// Container chính bao toàn bộ trang
export const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Chiều cao tối thiểu bằng chiều cao màn hình */
  background-color: #f5f5f5; /* Tùy chọn */
`

// Nội dung chính (children) chiếm phần còn lại
export const LayoutContent = styled.main`
  flex: 1;
  padding: 24px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
  }
`