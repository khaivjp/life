/* Hướng dẫn tra cứu đơn hàng: Delivery, SPX 2H, Shopee. */
(() => {
  const K = window.KhaiLife;
  const services = [
    {
      id:"delivery",title:"Delivery",subtitle:"Đồ ăn và hàng từ cửa hàng",emoji:"🍜",
      steps:["Nhận đơn, xem đúng địa chỉ lấy và giao, món/số túi, số tiền phải trả quán và phải thu khách.","Đến quán, báo mã đơn; xác nhận số túi/món, niêm phong và hóa đơn nếu có. Không tự mở túi niêm phong.","Chỉ trả tiền quán nếu ứng dụng ghi rõ khoản phải trả; giữ hóa đơn khi cần.","Xác nhận đã lấy hàng trên ứng dụng; vận chuyển cẩn thận và đến đúng điểm giao.","Liên hệ khách qua ứng dụng khi cần, giao đúng người, thu đúng khoản phải thu hiển thị rồi hoàn thành đơn."],
      failed:["Nếu hủy trước khi lấy: kiểm tra trạng thái đơn, không tự ứng tiền hay nhận hàng; nếu đã đến quán, trao đổi với quán/hỗ trợ.","Nếu hủy sau khi đã lấy: giữ nguyên hàng và bằng chứng; liên hệ hỗ trợ trong ứng dụng, không tự ý bỏ hoặc sử dụng hàng.","Nếu khách không nghe máy/từ chối nhận: báo đã đến qua chức năng của ứng dụng (nếu có), liên hệ qua kênh ứng dụng, lưu lịch sử cuộc gọi và làm theo hướng dẫn hỗ trợ.","Nếu quán đóng cửa, thiếu món hoặc chậm: chụp biển hiệu/tình trạng, báo quán và hỗ trợ; không tự đổi món hay tự hủy sai lý do."],
      photos:["Tại quán: túi hàng và tem niêm phong, số túi; hóa đơn/mã đơn nếu cần đối chiếu.","Nếu quán đóng: ảnh cửa quán và biển hiệu rõ ràng, không chụp người không liên quan.","Khi giao: ảnh bàn giao hoặc vị trí đặt hàng chỉ khi ứng dụng yêu cầu và khách đồng ý; tránh lộ mặt/số điện thoại.","Khi sự cố: ảnh hiện trạng túi hàng, màn hình trạng thái (che thông tin cá nhân nếu chia sẻ), lịch sử liên lạc."]
    },
    {
      id:"spx2h",title:"SPX 2H",subtitle:"Kiện hàng giao nhanh",emoji:"📦",
      steps:["Nhận đơn, kiểm tra địa chỉ lấy/giao, số kiện, mã vận đơn, COD và mốc thời gian hiển thị.","Đến điểm lấy; đối chiếu mã trên kiện và trên ứng dụng, kiểm tra bao bì còn nguyên và hàng được phép vận chuyển.","Chỉ xác nhận nhận hàng sau khi đã thực nhận đúng số kiện; không tự ứng tiền nếu đơn không yêu cầu rõ.","Đến người nhận theo lộ trình; liên hệ an toàn khi đã dừng xe.","Đối chiếu người nhận, thu đúng COD hiển thị (nếu có), ghi nhận bằng chứng theo ứng dụng rồi hoàn thành."],
      failed:["Nếu đơn bị hủy khi chưa lấy: kiểm tra trạng thái và không nhận thêm kiện đã hủy.","Nếu bị hủy hoặc giao thất bại sau khi lấy: giữ nguyên kiện, báo hỗ trợ để nhận chỉ dẫn trả hàng/điểm hoàn; không tự ý xử lý kiện.","Nếu người nhận không liên lạc hoặc từ chối: lưu lịch sử liên hệ, lý do, ảnh kiện; dùng chức năng giao thất bại và làm đúng quy trình hoàn trả hiện hành.","Khi kiện rách/hỏng/sai mã: chụp hiện trạng trước khi nhận (nếu an toàn), báo người gửi và hỗ trợ; không tự mở kiện."],
      photos:["Khi lấy: toàn bộ kiện, tình trạng bao bì và mã vận đơn đủ để đối chiếu.","Khi có hư hỏng: ảnh rõ phần rách/móp/ướt, tổng thể kiện và thời điểm phát hiện.","Khi giao: ảnh bằng chứng theo yêu cầu ứng dụng, không công khai thông tin trên nhãn.","Khi hoàn: ảnh nguyên trạng kiện, chứng từ hoặc xác nhận bàn giao tại điểm trả nếu được yêu cầu."]
    },
    {
      id:"shopee",title:"Shopee",subtitle:"Kiện hàng từ đơn mua sắm Shopee",emoji:"🛍️",
      steps:["Nhận đơn, xem mã vận đơn, địa chỉ người bán/điểm lấy và người mua, thời hạn và khoản thu hiển thị.","Đến điểm lấy hàng; đối chiếu mã vận đơn, số kiện và bao bì; xác nhận lấy chỉ khi đã thực nhận.","Không ứng tiền mua sản phẩm cho người bán theo loại đơn Shopee; làm đúng thông tin thanh toán trong ứng dụng.","Di chuyển đến người nhận, đối chiếu thông tin, thu tiền chỉ khi có khoản phải thu được hiển thị.","Bàn giao đúng kiện và ghi nhận xác nhận/ảnh theo yêu cầu ứng dụng, sau đó cập nhật hoàn tất."],
      failed:["Hủy trước khi nhận: không nhận kiện; kiểm tra trạng thái đơn trên ứng dụng.","Hủy sau khi nhận hoặc người mua từ chối: giữ nguyên kiện, liên hệ hỗ trợ và theo hướng dẫn trả lại cho người gửi/điểm hoàn.","Không liên hệ được người nhận: thực hiện các bước gọi/nhắn theo hướng dẫn hiện tại của ứng dụng; lưu bằng chứng, không tự bấm giao thành công.","Nếu thông tin vận đơn sai, kiện thiếu hoặc hỏng: chụp hiện trạng, báo người gửi và hỗ trợ trước khi chuyển trạng thái."],
      photos:["Tại điểm lấy: kiện hàng, nhãn/mã vận đơn đúng với đơn, tình trạng niêm phong.","Khi giao: bằng chứng bàn giao/ảnh theo yêu cầu ứng dụng; ưu tiên tránh chụp mặt người nhận.","Khi giao thất bại: ảnh nguyên kiện, trạng thái liên hệ và các thông báo trong ứng dụng.","Khi trả hàng: ảnh kiện và xác nhận người/điểm nhận hoàn theo hướng dẫn ứng dụng."]
    }
  ];
  const safe = text => String(text).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const section = (heading, items) => `<section class="sf-section"><h3>${safe(heading)}</h3><ol>${items.map(s=>`<li>${safe(s)}</li>`).join("")}</ol></section>`;
  K.shopeefood = {
    render(root) {
      root.innerHTML = `<div class="sf-guide">
        <header class="sf-hero"><span class="sf-eyebrow">SỔ TAY TRA CỨU</span><h1>Giao hàng ShopeeFood</h1><p>Chỉ 3 nhóm đang có trên màn hình nhận đơn: <strong>Delivery · SPX 2H · Shopee</strong>.</p></header>
        <div class="sf-notice"><strong>Lưu ý:</strong> Đây là checklist tham khảo, không thay thế quy trình trên ứng dụng. Yêu cầu chụp ảnh, thời gian chờ, COD và xử lý hoàn hàng có thể thay đổi theo dịch vụ, khu vực và từng đơn. Không sử dụng điện thoại khi đang điều khiển xe.</div>
        <div class="sf-tabs" role="tablist" aria-label="Loại đơn">${services.map((s,i)=>`<button class="sf-tab" role="tab" aria-selected="${i===0}" data-service="${s.id}">${s.emoji} ${s.title}</button>`).join("")}</div>
        <div id="sf-detail"></div>
        <section class="sf-footer-note"><h3>Ảnh nào là bắt buộc?</h3><p>Chỉ những ảnh được ứng dụng yêu cầu ở bước thực tế mới là yêu cầu bắt buộc. Danh sách ảnh ở trên là gợi ý lưu bằng chứng khi cần xử lý sự cố. Không chụp giấy tờ tùy thân hay công khai địa chỉ, số điện thoại, mã đơn của khách.</p>
        <p>Đối chiếu thông báo mới tại <a href="https://driver.shopeefood.vn/" target="_blank" rel="noopener noreferrer">Cổng thông tin tài xế ShopeeFood</a> và phần Trợ giúp trên ứng dụng.</p></section>
      </div>`;
      const details = root.querySelector("#sf-detail");
      const tabs = [...root.querySelectorAll("[data-service]")];
      function show(id) {
        const service=services.find(s=>s.id===id)||services[0];
        tabs.forEach(btn=>{const active=btn.dataset.service===service.id;btn.classList.toggle("active",active);btn.setAttribute("aria-selected",String(active));});
        details.innerHTML=`<div class="sf-card"><h2>${service.emoji} ${safe(service.title)}</h2><p class="sf-subtitle">${safe(service.subtitle)}</p>
          ${section("1. Cách nhận và giao đơn",service.steps)}
          ${section("2. Khi đơn bị hủy hoặc giao không thành công",service.failed)}
          ${section("3. Nên chụp ảnh những gì?",service.photos)}
          <div class="sf-notice"><strong>Kiểm tra trước khi bấm hoàn thành:</strong> Đúng người nhận · Đúng số kiện/túi · Thu đúng tiền ứng dụng · Bằng chứng theo yêu cầu.</div>
        </div>`;
      }
      tabs.forEach(btn=>btn.addEventListener("click",()=>show(btn.dataset.service)));
      show("delivery");
    }
  };
})();
