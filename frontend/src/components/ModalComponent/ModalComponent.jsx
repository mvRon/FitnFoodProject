import { Modal } from 'antd'
import React from 'react'

const ModalComponent = ({ title = 'Modal', open = false, children, ...rests }) => {
    const { okButtonProps, cancelButtonProps, ...modalProps } = rests

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
                ...okButtonProps,
                style: {
                    background: 'linear-gradient(135deg, #10B981, #0284C7)',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)',
                    borderRadius: 10,
                    minHeight: 38,
                    fontWeight: 600,
                    ...(okButtonProps?.style || {}),
                },
            }}
            cancelButtonProps={{
                ...cancelButtonProps,
                style: {
                    borderRadius: 10,
                    minHeight: 38,
                    borderColor: 'rgba(2, 132, 199, 0.4)',
                    color: '#0369A1',
                    fontWeight: 600,
                    ...(cancelButtonProps?.style || {}),
                },
            }}
            {...modalProps}
        >
            {children}
        </Modal>
    )
}

export default ModalComponent