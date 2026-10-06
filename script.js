// =========================================
// SỐ CHỖ CÒN TRỐNG HÔM NAY: sửa số ở đây là xong
// Ví dụ  9: 2  nghĩa là khung 09:00 còn 2 chỗ
// (Đây là số mô phỏng. Khi có dữ liệu thật thì thay vào.)
// =========================================
const choConTrong = {
  9: 2, 10: 3, 11: 1, 12: 0, 13: 2, 14: 3,
  15: 1, 16: 2, 17: 0, 18: 1, 19: 0, 20: 2
};

const TOI_DA_MOI_GIO = 3;           // mỗi giờ nhận tối đa 3 khách
const NGAY_MO_CN2 = '2026-10-10';   // CN2 Hà Nội khai trương ngày này

// Lấy phần tử theo id cho ngắn
function lay(id) {
  return document.getElementById(id);
}

// Đổi ngày thành chữ dạng 2026-10-06
function dangChu(d) {
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + thang + '-' + ngay;
}

const gioHienTai = new Date().getHours();
const homNay = dangChu(new Date());
let ngayChon = homNay;    // ngày khách đang chọn
let gioChon = null;       // giờ khách đang chọn

// Hôm nay, khung giờ này còn mấy chỗ (giờ đã qua thì là 0)
function conCho(gio) {
  return gio > gioHienTai ? choConTrong[gio] : 0;
}

// ----- 1. Quán đang mở hay đóng -----
if (gioHienTai >= 9 && gioHienTai < 21) {
  lay('openStatus').textContent = 'Đang mở cửa';
} else {
  lay('openStatus').textContent = 'Đang đóng cửa, mở lại lúc 09:00';
}

// ----- 2. Vòng tròn + biểu đồ cột số slot hôm nay -----
function veSlotHomNay() {
  let tong = 0;
  let toiDa = 0;
  let cacCot = '';

  for (let gio = 9; gio < 21; gio++) {
    const conLai = gio > gioHienTai;
    const con = conCho(gio);
    tong = tong + con;
    if (conLai) toiDa = toiDa + TOI_DA_MOI_GIO;

    const doCao = conLai ? Math.max(8, (con / TOI_DA_MOI_GIO) * 100) : 8;
    cacCot += '<div class="cot ' + (conLai ? '' : 'qua') + '" title="' + gio + ':00, còn ' + con + ' chỗ">'
            + '<i style="height:' + doCao + '%"></i><span>' + gio + '</span></div>';
  }

  lay('freeCount').textContent = tong;
  lay('heroSlots').textContent = tong;
  lay('bars').innerHTML = cacCot;
  lay('ring').style.setProperty('--p', toiDa ? (tong / toiDa) * 100 : 0);

  if (tong === 0) {
    lay('freeNote').textContent = 'Hôm nay đã hết slot, bạn chọn ngày mai nhé.';
  } else if (tong <= 5) {
    lay('freeNote').textContent = 'Sắp hết chỗ, nên giữ lịch sớm.';
  } else {
    lay('freeNote').textContent = 'Còn trống từ bây giờ đến 21:00.';
  }
}

// ----- 3. Nút chọn ngày (7 ngày tới) -----
function veNgay() {
  const thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const chu = dangChu(d);
    const ten = i === 0 ? 'Hôm nay' : thu[d.getDay()];
    const ngayThang = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
    html += '<button type="button" class="pick' + (chu === ngayChon ? ' chon' : '') + '" data-ngay="' + chu + '">'
          + ten + '<small>' + ngayThang + '</small></button>';
  }
  lay('dates').innerHTML = html;
}

// ----- 4. Nút chọn giờ -----
function veGio() {
  const laHomNay = ngayChon === homNay;
  let html = '';

  for (let gio = 9; gio < 21; gio++) {
    let chuNho = 'còn chỗ';
    let khongChon = false;

    if (laHomNay) {
      if (gio <= gioHienTai) { chuNho = 'đã qua'; khongChon = true; }
      else if (choConTrong[gio] === 0) { chuNho = 'hết chỗ'; khongChon = true; }
      else { chuNho = 'còn ' + choConTrong[gio]; }
    }

    html += '<button type="button" class="pick' + (gio === gioChon ? ' chon' : '') + '" data-gio="' + gio + '"'
          + (khongChon ? ' disabled' : '') + '>' + String(gio).padStart(2, '0') + ':00<small>' + chuNho + '</small></button>';
  }
  lay('times').innerHTML = html;
}

// Bấm vào ngày
lay('dates').addEventListener('click', function (e) {
  const nut = e.target.closest('button');
  if (!nut) return;
  ngayChon = nut.dataset.ngay;
  gioChon = null;
  veNgay();
  veGio();
});

// Bấm vào giờ
lay('times').addEventListener('click', function (e) {
  const nut = e.target.closest('button');
  if (!nut || nut.disabled) return;
  gioChon = Number(nut.dataset.gio);
  veGio();
});

// ----- 5. Bấm nút "Giữ chỗ" -----
lay('bookForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const ten = lay('name').value.trim();
  const sdt = lay('phone').value.replace(/[\s.\-]/g, '');
  const thongBao = lay('message');
  const chiNhanh = lay('branch').value;

  if (gioChon === null) {
    thongBao.textContent = 'Bạn chọn giờ còn trống trước nhé.';
    return;
  }
  if (chiNhanh === 'cn2' && ngayChon < NGAY_MO_CN2) {
    thongBao.textContent = 'CN2 Hà Nội khai trương 10/10/2026, bạn chọn từ ngày 10/10 nhé.';
    return;
  }
  if (ten.length < 2) {
    thongBao.textContent = 'Bạn nhập họ tên giúp Dany nhé.';
    return;
  }
  if (!/^0\d{9}$/.test(sdt)) {
    thongBao.textContent = 'Số điện thoại cần 10 số, ví dụ 0901234567.';
    return;
  }
  thongBao.textContent = '';

  // Giữ chỗ hôm nay thì trừ đi 1 slot và vẽ lại
  if (ngayChon === homNay) {
    choConTrong[gioChon] = choConTrong[gioChon] - 1;
    veSlotHomNay();
  }

  // Hiện màn xác nhận
  const tenChiNhanh = chiNhanh === 'cn2' ? 'CN2 Hoàn Kiếm, Hà Nội' : 'CN1 Tân Định, Quận 1';
  lay('doneText').innerHTML = '<strong>' + ten + '</strong><br>'
    + String(gioChon).padStart(2, '0') + ':00 ngày ' + ngayChon.slice(8) + '/' + ngayChon.slice(5, 7) + '<br>'
    + tenChiNhanh + '<br>' + lay('service').value;
  lay('bookForm').hidden = true;
  lay('done').hidden = false;
});

// Bấm "Đặt thêm lịch" thì quay lại form
lay('againBtn').addEventListener('click', function () {
  gioChon = null;
  veGio();
  lay('done').hidden = true;
  lay('bookForm').hidden = false;
});

// ----- CHẠY KHI MỞ TRANG -----
veNgay();
veGio();
veSlotHomNay();
// Vòng tròn chạy từ 0 lên số thật cho đẹp
lay('ring').style.setProperty('--p', 0);
setTimeout(veSlotHomNay, 300);
