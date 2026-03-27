import styled from 'styled-components';

export const OrderSuccessWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    background:
      radial-gradient(circle at 14% 12%, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0) 34%),
      radial-gradient(circle at 88% 12%, rgba(2, 132, 199, 0.16), rgba(2, 132, 199, 0) 34%),
      #f8fafc;
    padding: 24px;

    .ant-result {
        position: relative;
        overflow: hidden;
        background: linear-gradient(145deg, #ffffff, #f8fafc);
        padding: 52px 34px;
        border-radius: 20px;
        border: 1px solid rgba(2, 132, 199, 0.2);
        box-shadow: 0 20px 34px rgba(15, 23, 42, 0.1);
        max-width: 560px;
        width: 100%;
        text-align: center;

        &::before {
          content: "";
          position: absolute;
          top: -30px;
          right: -30px;
          width: 120px;
          height: 120px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(2, 132, 199, 0.25), rgba(2, 132, 199, 0));
        }
    }

    .ant-result-icon .anticon {
        font-size: 74px;
    }

    .ant-result-title {
        font-size: 28px;
        font-weight: 800;
        color: #1e293b;
        margin-bottom: 8px;
    }

    .ant-result-subtitle {
        font-size: 16px;
        color: #475569;
        margin-bottom: 24px;
        max-width: 420px;
        margin-left: auto;
        margin-right: auto;
    }

    .ant-result-extra {
        margin-top: 32px;
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .ant-btn-primary {
        background: linear-gradient(135deg, #10b981, #0284c7);
        border: none;
        border-radius: 10px;
        font-weight: 700;
        box-shadow: 0 10px 22px rgba(2, 132, 199, 0.22);
    }

    .ant-btn-default {
        border-radius: 10px;
        border-color: rgba(2, 132, 199, 0.35);
        color: #0369a1;
        font-weight: 700;
    }
`;