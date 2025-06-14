const plateEl = document.getElementById("plate");
const qrcodeEl = document.getElementById("qrcode");

let cars = [];
let currentIndex = 0;
let qr;

async function fetchCars() {
  try {
    const res = await fetch("/api/vehicle");
    const json = await res.json();

    // 假设接口返回结构如下
    // { data: { items: [ { fields: { 车牌: "123", 状态: "空闲中", 二维码: "http://..." } }, ... ] } }

    cars = json.data.items
      .map(item => item.fields)
      .filter(item => item.车辆状态 === "空闲中");

    if (cars.length === 0) {
      plateEl.textContent = "暂无空闲车辆";
      qrcodeEl.innerHTML = "";
      return;
    }

    showCar(cars[0]);

    setInterval(() => {
      currentIndex = (currentIndex + 1) % cars.length;
      showCar(cars[currentIndex]);
    }, 10000);

  } catch (e) {
    plateEl.textContent = "获取数据失败";
    console.error(e);
  }
}

function showCar(car) {
  plateEl.textContent = `车牌号：${car.车牌}`;
  qrcodeEl.innerHTML = "";
  qr = new QRCode(qrcodeEl, {
    text: car.二维码,
    width: 200,
    height: 200
  });
}

fetchCars();
