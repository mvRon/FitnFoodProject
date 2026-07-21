import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useMap } from "react-leaflet";

// =================================================================
// BƯỚC 1: ĐỊNH NGHĨA BỘ TỪ ĐIỂN TIẾNG VIỆT CHO ROUTING MACHINE
// =================================================================
L.Routing.Localization['vi'] = {
    directions: {
        N: 'hướng Bắc',
        NE: 'hướng Đông Bắc',
        E: 'hướng Đông',
        SE: 'hướng Đông Nam',
        S: 'hướng Nam',
        SW: 'hướng Tây Nam',
        W: 'hướng Tây',
        NW: 'hướng Tây Bắc'
    },
    instructions: {
        'Head': ['Đi về {dir}', ' trên {road}'],
        'Continue': ['Tiếp tục đi thẳng', ' trên {road}'],
        'SlightRight': ['Hơi rẽ phải', ' vào {road}'],
        'Right': ['Rẽ phải', ' vào {road}'],
        'SharpRight': ['Rẽ ngoặt sang phải', ' vào {road}'],
        'TurnAround': ['Quay đầu xe lại'],
        'SharpLeft': ['Rẽ ngoặt sang trái', ' vào {road}'],
        'Left': ['Rẽ trái', ' vào {road}'],
        'SlightLeft': ['Hơi rẽ trái', ' vào {road}'],
        'WaypointReached': ['Đã đến điểm dừng'],
        'Roundabout': ['Đi qua vòng xuyến và ra ở lối thứ {exitStr}', ' vào {road}'],
        'DestinationReached': ['Đã đến điểm giao hàng FITNFOOD!'],
        'Fork': ['Đi theo nhánh rẽ', ' vào {road}'],
        'Merge': ['Nhập làn', ' vào {road}'],
        'On ramp': ['Đi vào đường dẫn', ' vào {road}'],
        'Off ramp': ['Đi ra khỏi đường dẫn', ' vào {road}'],
        'EndOfRoad': ['Đến cuối đường rẽ', ' vào {road}']
    },
    formatOrder: function (n) {
        return n; // Định dạng số đếm lối ra vòng xuyến (1, 2, 3...)
    }
};

const RoutingMachine = ({ start, end }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    // EFFECT 1: Khởi tạo Routing Control
    useEffect(() => {
        if (!map) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],

            // BƯỚC 2: GỌI GÓI NGÔN NGỮ 'vi' VỪA ĐỊNH NGHĨA Ở TRÊN
            language: 'vi',

            routeWhileDragging: false,
            addWaypoints: false,
            fitSelectedRoutes: false,
            showAlternatives: false,
            createMarker: function () { return null; },
            lineOptions: {
                styles: [{ color: "#2196F3", weight: 5, opacity: 0.8 }]
            },
            show: true // Vẫn giữ True để hiện bảng chỉ đường
        }).addTo(map);

        routingControlRef.current = routingControl;

        return () => {
            try {
                if (map && routingControlRef.current) {
                    map.removeControl(routingControlRef.current);
                }
            } catch (error) {
                console.warn("Lỗi khi dọn dẹp routing control:", error);
            }
        };
    }, [map]);

    // EFFECT 2: Cập nhật tọa độ
    useEffect(() => {
        if (routingControlRef.current && start && end) {
            routingControlRef.current.setWaypoints([
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ]);
        }
    }, [start, end]);

    return null;
};

export default RoutingMachine;