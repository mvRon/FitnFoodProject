import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// IMPORT COMPONENT ĐỊNH TUYẾN MỚI TẠO
import RoutingMachine from './RoutingMachine';

// 1. ICON XE TẢI (Từ thư viện Icons8)
const truckIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/48/truck.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// 2. ICON ĐIỂM ĐẾN (Ngôi nhà)
const homeIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/48/home.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40], // Neo ở đáy ngôi nhà
    popupAnchor: [0, -40]
});

const AdminTrackingComponent = () => {
    const [truckStatus, setTruckStatus] = useState(null);
    const [path, setPath] = useState([]);

    // Biến lưu trữ instance của bản đồ để có thể điều khiển camera thủ công
    const [map, setMap] = useState(null);

    // Giả lập tọa độ đích: Một điểm giao hàng tại TP.HCM
    const destination = [10.7769, 106.7009];

    useEffect(() => {
        const truckRef = ref(database, 'vehicles/FITNFOOD_TRUCK_01/current_status');
        const unsubscribe = onValue(truckRef, (snapshot) => {
            const data = snapshot.val();

            // LỌC NHIỄU GPS: Chỉ nhận dữ liệu nếu tọa độ khác 0
            if (data && data.location.lat !== 0 && data.location.lng !== 0) {
                setTruckStatus(data);
                const newPos = [data.location.lat, data.location.lng];
                setPath(prevPath => [...prevPath, newPos]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Hàm lia camera về vị trí xe khi người dùng bấm nút
    const handleFocusVehicle = () => {
        if (map && truckStatus) {
            map.flyTo([truckStatus.location.lat, truckStatus.location.lng], 16, { animate: true });
        }
    };

    if (!truckStatus) return <div>Đang kết nối vệ tinh và lấy tọa độ... (Hãy chắc chắn mạch GPS ở ngoài trời)</div>;

    const position = [truckStatus.location.lat, truckStatus.location.lng];

    // ĐỒNG BỘ LOGIC BACKEND: Cảnh báo khi nhiệt độ ngoài khoảng 5 - 10 độ C
    const isAbnormalTemp = truckStatus.temperature < 5.0 || truckStatus.temperature > 35.0;

    return (
        <div style={{ height: '600px', width: '100%', border: '1px solid #ccc', position: 'relative' }}>
            {/* Thanh trạng thái */}
            <div style={{
                padding: '15px',
                backgroundColor: isAbnormalTemp ? '#ffebee' : '#e8f5e9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ margin: '0 0 5px 0' }}>Giám sát hành trình: FITNFOOD_TRUCK_01</h3>
                    <p style={{ margin: 0, color: isAbnormalTemp ? 'red' : 'green', fontWeight: 'bold' }}>
                        Nhiệt độ thùng hàng: {truckStatus.temperature}°C {isAbnormalTemp ? '(CẢNH BÁO)' : '(An toàn)'}
                    </p>
                </div>

                {/* NÚT FOCUS CAMERA */}
                <button
                    onClick={handleFocusVehicle}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}
                >
                    🎯 Bám sát xe tải
                </button>
            </div>

            {/* BẢN ĐỒ */}
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: '500px', width: '100%' }}
                ref={setMap} // Gán ref để lấy instance của map
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                {/* 1. ĐOẠN ĐƯỜNG ĐÃ ĐI: Màu xám, nét đứt, mờ */}
                <Polyline
                    positions={path}
                    color="#9e9e9e"
                    weight={5}
                    opacity={0.6}
                    dashArray="5, 10"
                />

                {/* 2. ĐOẠN ĐƯỜNG CÒN LẠI: Sử dụng RoutingMachine để vẽ đường bám sát giao thông thực tế */}
                <RoutingMachine start={position} end={destination} />

                <Marker position={position} icon={truckIcon}>
                    <Popup>Xe đang giao hàng<br />Nhiệt độ: {truckStatus.temperature}°C</Popup>
                </Marker>

                <Marker position={destination} icon={homeIcon}>
                    <Popup>Điểm đích (Khách hàng)</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default AdminTrackingComponent;