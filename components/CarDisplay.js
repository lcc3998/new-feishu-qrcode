import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

export default function CarDisplay() {
  const [cars, setCars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 获取数据，后端已筛选只返回空闲车辆
  const fetchCars = async () => {
    try {
      const res = await fetch("/api/feishu"); // 确保路径指向你的 API
      const data = await res.json();
      setCars(data || []);
    } catch (err) {
      console.error("获取失败", err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // 每10秒切换一次车辆显示
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (cars.length > 0 ? (prev + 1) % cars.length : 0));
    }, 10000);
    return () => clearInterval(interval);
  }, [cars]);

  const currentCar = cars[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-80 max-w-full text-center">
        <h2 className="text-2xl font-bold mb-6">当前空闲车辆</h2>
        {currentCar ? (
          <>
            <p className="text-lg font-medium mb-4">车牌号：{currentCar.车牌}</p>
            <QRCode value={currentCar.二维码} size={200} />
          </>
        ) : (
          <p className="text-gray-500 text-lg">暂无空闲车辆</p>
        )}
      </div>
    </div>
  );
}
