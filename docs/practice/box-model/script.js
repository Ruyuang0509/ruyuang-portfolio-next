// 最基礎的一段 JS：抓元素 → 綁事件 → 換 class。
// 版面樣式全部留在 CSS，JS 只負責切換 .is-annotated 這個開關。
const checkbox = document.getElementById("annotate");

function syncAnnotation() {
  document.body.classList.toggle("is-annotated", checkbox.checked);
}

checkbox.addEventListener("change", syncAnnotation);
syncAnnotation(); // 進頁面時先跑一次，讓畫面和勾選狀態一致
