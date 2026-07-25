import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../firebase';
import { ref, onValue, set } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// IMPORT COMPONENT ĐỊNH TUYẾN MỚI TẠO
import RoutingMachine from './RoutingMachine';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
    const [tempHistory, setTempHistory] = useState([]);
    const chartScrollRef = useRef(null);

    // Tự động cuộn biểu đồ tới thời điểm hiện tại (bên phải)
    useEffect(() => {
        if (chartScrollRef.current) {
            chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
        }
    }, [tempHistory]);

    // Biến lưu trữ instance của bản đồ để có thể điều khiển camera thủ công
    const [map, setMap] = useState(null);

    // Giả lập tọa độ đích: Một điểm giao hàng tại TP.HCM
    const destination = [10.7769, 106.7009];

    useEffect(() => {
        const historyRef = ref(database, 'vehicles/FITNFOOD_TRUCK_01/history');
        const unsubHistory = onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            setTempHistory(Array.isArray(data) ? data : (data ? Object.values(data) : []));
        });

        // Lấy lịch sử đường đi từ Firebase
        const pathHistoryRef = ref(database, 'vehicles/FITNFOOD_TRUCK_01/path_history');
        const unsubPathHistory = onValue(pathHistoryRef, (snapshot) => {
            const data = snapshot.val();
            setPath(Array.isArray(data) ? data : (data ? Object.values(data) : []));
        });

        const truckRef = ref(database, 'vehicles/FITNFOOD_TRUCK_01/current_status');
        const unsubscribe = onValue(truckRef, (snapshot) => {
            const data = snapshot.val();

            // LỌC NHIỄU GPS: Chỉ nhận dữ liệu nếu tọa độ khác 0
            if (data && data.location.lat !== 0 && data.location.lng !== 0) {
                setTruckStatus(data);
                const newPos = [data.location.lat, data.location.lng];
                
                setPath(prevPath => {
                    const currentPath = Array.isArray(prevPath) ? prevPath : [];
                    const lastPos = currentPath[currentPath.length - 1];
                    // Tránh lưu trùng lặp tọa độ nếu xe chưa di chuyển
                    if (lastPos && lastPos[0] === newPos[0] && lastPos[1] === newPos[1]) {
                        return currentPath;
                    }
                    const newPath = [...currentPath, newPos];
                    
                    // Cập nhật đường đi lên Firebase
                    set(pathHistoryRef, newPath);
                    return newPath;
                });

                const currentTime = new Date().toLocaleTimeString();
                setTempHistory(prev => {
                    const currentHistory = Array.isArray(prev) ? prev : [];
                    const lastEntry = currentHistory[currentHistory.length - 1];
                    // Tránh ghi đè/lưu trùng lặp cùng một thời điểm
                    if (lastEntry && lastEntry.time === currentTime && lastEntry.temp === data.temperature) {
                        return currentHistory;
                    }
                    const newHistory = [...currentHistory, { time: currentTime, temp: data.temperature }];
                    const trimmedHistory = newHistory.slice(-200); // Tăng giới hạn lưu trữ để có thể xem lại quá khứ

                    // Đẩy mảng lịch sử mới lên Firebase để đồng bộ
                    set(historyRef, trimmedHistory);

                    return trimmedHistory;
                });
            }
        });
        return () => {
            unsubscribe();
            unsubHistory();
            unsubPathHistory();
        };
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

    const chartData = {
        labels: tempHistory.map(item => item.time),
        datasets: [
            {
                label: 'Nhiệt độ thùng hàng (°C)',
                data: tempHistory.map(item => item.temp),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ nhiệt độ theo thời gian',
            }
        },
        scales: {
            y: {
                suggestedMin: 0,
                suggestedMax: 40
            }
        }
    };

    return (
        <div style={{ width: '100%', border: '1px solid #ccc', position: 'relative' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%' }}>
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

                {/* 1. ĐOẠN ĐƯỜNG ĐÃ ĐI: Màu đỏ, nét đứt, mờ */}
                <Polyline
                    positions={path}
                    color="red"
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
                
                <div 
                    ref={chartScrollRef} 
                    style={{ width: '100%', padding: '15px', boxSizing: 'border-box', marginTop: '20px', overflowX: 'auto', overflowY: 'hidden' }}
                >
                    {/* Bọc biểu đồ trong div có chiều rộng linh động để tạo thanh cuộn ngang tự nhiên */}
                    <div style={{ width: tempHistory.length > 20 ? `${tempHistory.length * 50}px` : '100%', minWidth: '100%', height: '350px' }}>
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTrackingComponent;