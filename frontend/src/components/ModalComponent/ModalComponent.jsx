import { Modal } from 'antd'
import React from 'react'

const ModalComponent = ({ title = 'Modal', open = false, children, ...rests }) => {
    const defaultStyles = {
        header: {
            borderBottom: '1px solid rgba(2, 132, 199, 0.16)',
            paddingBottom: 12,
            marginBottom: 8,
            background: 'linear-gradient(120deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08))',
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
        },
        content: {
            borderRadius: 14,
            border: '1px solid rgba(16, 185, 129, 0.18)',
            boxShadow: '0 20px 40px rgba(30, 41, 59, 0.12)',
            overflow: 'hidden',
        },
        body: {
            paddingTop: 10,
        },
        footer: {
            borderTop: '1px solid rgba(2, 132, 199, 0.12)',
            paddingTop: 12,
            marginTop: 8,
        },
    }

    return (
        <Modal
            title={title}
            open={open}
            styles={defaultStyles}
            okButtonProps={{
                style: {
                    background: 'var(--color-primary)',
                    borderColor: 'var(--color-primary)',
                    borderRadius: 10,
                    fontWeight: 600,
                },
            }}
            cancelButtonProps={{
                style: {
                    borderRadius: 10,
                    borderColor: 'rgba(2, 132, 199, 0.4)',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                },
            }}
            {...rests}
        >
            {children}
        </Modal>
    )
}

export default ModalComponent