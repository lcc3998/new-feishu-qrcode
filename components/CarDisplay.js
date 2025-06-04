import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

export default function CarDisplay() {
  const [cars, setCars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchCars = async () => {
    try {
      const res = await fetch("/api/feishu");
      const data = await res.json();
      const available = data.filter(item => item.状态 === "空闲中" && item.二维码 && item.车牌);
      setCars(available);
    } catch (err) {
      console.error("获取失败", err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (cars.length > 0 ? (prev + 1) % cars.length : 0));
    }, 10000);
    return () => clearInterval(interval);
  }, [cars]);

  const currentCar = cars[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-2xl font-semibold mb-6">当前空闲车辆</h1>
      {currentCar ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
          <div className="text-xl font-medium">车牌号：{currentCar.车牌}</div>
          <QRCode value={currentCar.二维码} size={160} />
        </div>
      ) : (
        <div className="text-gray-500">暂无空闲车辆</div>
      )}
    </div>
  );
}
