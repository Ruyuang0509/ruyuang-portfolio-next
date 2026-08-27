# 盒模型練習：div / h2 / img / p

課堂白板的程式碼版本。純 HTML + CSS + 一支基礎 JS，沒有框架、不需要 build，
用瀏覽器直接打開 `index.html` 就能看。

```
docs/practice/box-model/
├── index.html   結構（白板上的藍框、綠框、文字）
├── style.css    樣式（margin / padding 都寫在這裡）
└── script.js    標註開關（12 行，示範抓元素、綁事件、換 class）
```

## 白板對照表

| 白板上的東西 | 對應的程式碼 |
| --- | --- |
| 右上角 `* { margin: 0; padding: 0; }` | `style.css` 第 1 區的全域重置 |
| 藍色外框 `<div>` | `<div class="card">` |
| `<h2> ... </h2>` | `<h2 class="card__title">` |
| 綠色框 + 裡面的 `<img>` | `<figure class="card__figure">` 包住 `<img class="card__image">` |
| 右側連續的 `<p> ... </p>` | `<p class="card__text">` |
| 藍框「外面」的紅箭頭 | `.card { margin: 24px 0; }` |
| 藍框「裡面」的紅箭頭 | `.card { padding: 24px; }` |
| 綠框到圖片之間的紅箭頭 | `.card__figure { padding: 12px; }` |
| 段落與段落之間的紅箭頭 | `.card__text { margin-bottom: 12px; }` |

頁面上方那個勾選框打開後，會把 padding 佔掉的範圍染成紅色網底、
把各元素的邊界用紅色虛線框出來，就是白板紅箭頭的實際樣子。

## 三個重點

**1. margin 在外、padding 在內，中間隔著 border**

由外到內是：`margin` → `border` → `padding` → 內容。
要讓「兩個框之間」有距離用 margin；要讓「框和自己的內容」之間有距離用 padding。

**2. 為什麼一開始要 `* { margin: 0; padding: 0; }`**

`h1`~`h6`、`p`、`ul`、`body` 都帶著瀏覽器的預設 margin，
而且不同瀏覽器的數值不一定一樣。先歸零，之後看到的每一段間距
都是自己寫出來的，排版才可控。這裡還多加了 `box-sizing: border-box`，
讓 `width` 把 padding 和 border 算進去，給了寬度再加 padding 才不會撐爆。

**3. 間距只往一個方向給**

段落之間的空隙統一用 `margin-bottom`，不要上下都給。
上下都給的話，相鄰的兩個 margin 會發生「margin 合併（collapse）」——
不是相加，而是取比較大的那一個，算出來的距離常常和預期不符。
最後一個元素再用 `:last-child` 把 margin 歸零，卡片底部才不會多一段空白。

## 練習題

1. 把 `.card` 的 `padding` 從 `24px` 改成 `48px`，觀察紅色網底變寬、內容往內縮。
2. 把 `.card__image` 的 `display: block` 註解掉，看看圖片下方為什麼多出一條空隙。
3. 把 `.card__text` 改成 `margin: 12px 0`，打開開發者工具量段落間距——會發現是 12px 而不是 24px，這就是 margin 合併。
