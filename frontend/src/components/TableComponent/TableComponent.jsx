import { Button, Table } from 'antd'
import React, { useMemo, useState } from 'react'
import LoadingComponent from '../LoadingComponent/LoadingComponent';
// import { Excel } from "antd-table-saveas-excel";

const TableComponent = (props) => {

    const { selectionType = 'checkbox', data: dataSource = [], isPending = false, columns = [], handleDeleteMany } = props
    const [rowSelectedKeys, setRowSelectedKeys] = useState([])

    //Hiện tại chỉ xử lý export file excel cho các sản phẩm 
    //Nếu muốn làm thêm cho order và user thì phải chỉnh sửa trực tiếp vào trang quản lý
    const newColumnExport = useMemo(() => {
        const arr = columns?.filter((col) =>
            col.dataIndex !== 'action' &&
            col.dataIndex !== 'type' &&
            col.dataIndex !== 'image' &&
            col.dataIndex !== 'avatar'
        )
        return arr
    }, [columns])


    // rowSelection object indicates the need for row selection
    const rowSelection = {
        onChange: (selectedRowKeys, selectedRows) => {
            setRowSelectedKeys(selectedRowKeys)
        },
        // getCheckboxProps: (record) => ({
        //     disabled: record.name === 'Disabled User',
        //     // Column configuration not to be checked
        //     name: record.name,
        // }),
    };

    const handleDeleteAll = () => {
        handleDeleteMany(rowSelectedKeys)
    }

    // const handleExportExcel = () => {
    //     const excel = new Excel();
    //     excel
    //         .addSheet("test")
    //         .addColumns(newColumnExport)
    //         .addDataSource(dataSource, {
    //             str2Percent: true
    //         })
    //         .saveAs("Excel.xlsx");
    // };


    return (
        <LoadingComponent isPending={isPending}>
            {rowSelectedKeys.length > 0 && (
                <div style={{
                    background: '#ccc',
                    color: 'red',
                    fontWeight: 'bold',
                    padding: '10px',
                    cursor: 'pointer'
                }} onClick={handleDeleteAll}>
                    Xóa tất cả - Đã chọn {rowSelectedKeys.length}
                </div>
            )}
            {/* <Button onClick={handleExportExcel}>EXPORT TO EXCEL FILE</Button> */}
            <Table
                // rowSelection={{
                //     type: selectionType,
                //     ...rowSelection,
                // }}
                columns={columns}
                dataSource={dataSource}
                {...props}
            />
        </LoadingComponent>
    )
}

export default TableComponent