// gửi một yêu cầu kết nối tới server
const io = require("socket.io");
const socket = io();

const acknowlegment = (err) => {
  if (err) {
    return console.log(err);
  }
  console.log("gui tin nhan thanh cong");
};

document.getElementById("form-messages").addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.getElementById("input-messages").value;
  socket.emit("send-messages-client-to-server", message, acknowlegment);
});

socket.on("send-message-server-to-client", ({ username, time, content }) => {
  document.getElementById("messages-list").innerHTML += `
  <div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username}</p>
    <p class="message__date">${time}</p>
  </div>
  <div class="message__row2">
    <p class="message__content">
     ${content}
    </p>
  </div>
</div>

  `;
});

document.getElementById("btn-share-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Trinh duyet khong cung cap location");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    socket.emit("send-loaction-client-to-server", location);
  });
});

//xử lý query string
/**
 * {
 *    room: room,
 *    username: username,
 * }
 */

const { room, username } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.emit("join-room", { room, username });

socket.on("send-user-list", function (userList) {
  document.getElementById("user-list").innerHTML = userList
    .map(
      (user) => `
  <li class="app__item-user">${user.username}</li>
  `
    )
    .reduce((stringHtml, stringLi) => (stringHtml += stringLi), "");
});

socket.on("send-loaction-server-to-client", ({ username, time, content }) => {
  document.getElementById("messages-list").innerHTML += `
  <div class="message-item">
  <div class="message__row1">
    <p class="message__name">${username}</p>
    <p class="message__date">${time}</p>
  </div>
  <div class="message__row2">
    <a href=${content} target="_blank" class="message__content">
     Vi tri cua ${username}
    </a>
  </div>
</div>
  `;
});
