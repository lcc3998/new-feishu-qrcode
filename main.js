const plateEl = document.getElementById("plate");
const qrcodeEl = document.getElementById("qrcode");

let cars = [];
let currentIndex = 0;
let qr;

async function fetchCars() {
  try {
    const res = await fetch("/api/vehicle");
    const json = await res.json();

    // 过滤状态为“空闲中”的车辆
    cars = json.data.items
      .map(item => item.fields)
      .filter(item => item["车辆状态"] === "空闲中");

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
  plateEl.textContent = `车牌号：${car["车牌号"]}`;
  qrcodeEl.innerHTML = "";
  qr = new QRCode(qrcodeEl, {
    text: car["二维码链接"],
    width: 200,
    height: 200
  });
}

fetchCars();
