import { useEffect, useState } from "react";
import QRCode from "qrcode.react";

export default function CarDisplay() {
  const [cars, setCars] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 获取数据
  const fetchCars = async () => {
    try {
      const res = await fetch("/api/feishu");
      const json = await res.json();
      const available = json?.data?.items
        ?.map(item => item.fields)
        ?.filter(car => car?.状态 === "空闲中");
      setCars(available || []);
    } catch (err) {
      console.error("获取失败", err);
    }
  };

  // 页面加载时获取一次
  useEffect(() => {
    fetchCars();
  }, []);

  // 每10秒切换车辆
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        cars.length > 0 ? (prev + 1) % cars.length : 0
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [cars]);

  const currentCar = cars[currentIndex];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>当前空闲车辆</h2>
      {currentCar ? (
        <div style={styles.card}>
          <div style={styles.plate}>🚗 车牌号：{currentCar.车牌}</div>
          <QRCode
            value={currentCar.二维码}
            size={200}
            style={styles.qrcode}
          />
        </div>
      ) : (
        <div style={styles.noData}>暂无空闲车辆</div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "2rem",
    fontFamily: "sans-serif",
    background: "#f7f7f7",
    minHeight: "100vh",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
  },
  card: {
    display: "inline-block",
    padding: "1.5rem",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  plate: {
    fontSize: "1.4rem",
    marginBottom: "1rem",
    color: "#333",
  },
  qrcode: {
    margin: "0 auto",
  },
  noData: {
    color: "#888",
    fontSize: "1.2rem",
  },
};
