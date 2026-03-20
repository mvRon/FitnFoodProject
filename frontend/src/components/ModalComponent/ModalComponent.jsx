import { Modal } from 'antd'
import React from 'react'

const ModalComponent = ({ title = 'Modal', open = false, children, ...rests }) => {
    return (
        <Modal title={title} open={open} {...rests}>
            {children}
        </Modal>
    )
}

export default ModalComponent