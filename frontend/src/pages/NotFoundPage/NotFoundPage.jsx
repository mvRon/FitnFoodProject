import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
            <Result
                status="404"
                title={<span style={{ fontSize: '72px', fontWeight: 'bold', color: '#1890ff', textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>404</span>}
                subTitle={<span style={{ fontSize: '24px', color: '#595959' }}>Ối! Trang bạn tìm kiếm không tồn tại.</span>}
                extra={
                    <Button 
                        type="primary" 
                        size="large" 
                        style={{ borderRadius: '8px', padding: '0 32px', height: '48px', fontSize: '16px' }}
                        onClick={() => navigate('/')}
                    >
                        Quay về Trang chủ
                    </Button>
                }
            />
        </div>
    );
};

export default NotFoundPage;
