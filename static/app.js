//async(asynchronous/非同期)→「この関数の中でawaitを使いますよ」という宣言
// await:「この処理が完了するまで待ちますよ」という指示
//fetch():使用する際には、async/awaitをセットで書く！
//非同期処理：時間がかかる処理を待たずに、次の処理へ進む

// --- 1 DOM要素の取得 ---
const memoForm = document.getElementById("memo-form");
const memoTitle = document.getElementById("memo-title");
const memoBody = document.getElementById("memo-body");
const memoId = document.getElementById("memo-id");
const memoList = document.getElementById("memo-list");
const btnCreate = document.getElementById("btn-create");
const btnUpdate = document.getElementById("btn-update");
const btnDelete = document.getElementById("btn-delete");
const btnCancel = document.getElementById("btn-cancel");


// --- 2 メモ一覧を読み込む ---
async function fetchMemos() {

  //fetch("/api/memos")でGETリクエストを送信
  const response = await fetch("/api/memos");

  //response.json()でレスポンスのJSONを解析
  const memos = await response.json();

  //メモ一覧エリアをクリア
  memoList.innerHTML = "";

  if (memos.length === 0) {
    memoList.innerHTML = '<p class="empty-message">メモがありません。上のフォームから作成してみましょう。</p>';
    return;
  }

  //各メモをカードとして表示
  memos.forEach(function (memo) {

    //新しいdiv要素を作成
    const card = document.createElement("div");

    //CSSクラスを設定する(class="memo-card")
    card.className = "memo-card";

    //要素の中身をHTMLで設定する
    card.innerHTML =
      "<h3>" + memo.title + "</h3>" +
      "<p>" + memo.body + "</p>" +
      '<span class="memo-date">更新：' + memo.updated_at + "</span>";

    //カードをクリックしたらメモを選択
    card.addEventListener("click", function () {

      selectMemo(memo);

      //選択状態のスタイルを付ける
      document.querySelectorAll(".memo-card").forEach(function (c) {
        c.classList.remove("selected");
      });

      card.classList.add("selected");
    });

    //親要素の中に子要素を追加する
    memoList.appendChild(card);
  });
}

  // --- 3 メモを作成する ---
  async function createMemo() {
    //trim():文字列の前後の空白を除去する
    var title = memoTitle.value.trim();
    var body = memoBody.value.trim();

    if (!title || !body) {
      alert("タイトルと本文を入力して下さい");
      return;
    }

    //POSTリクエスト
    await fetch("/api/memos", {
      method: "POST",
      headers: {
        "Content-Type":"application/json",},
      body: JSON.stringify({title:title,body:body}),
    });

    resetForm();
    fetchMemos();
  }


// --- 4 メモを選択する（編集モードにする） ---
function selectMemo(memo) {

  //フォームにメモのタイトル・本文が入る
  //隠しフィールド(memo-id)にメモのIDが保存される
  memoId.value = memo.id;
  memoTitle.value = memo.title;
  memoBody.value = memo.body;

  //ボタンの状態を切り替え
  //disabled:無効
  //「作成」ボタンが無効化される
  btnCreate.disabled = true;

  //「更新」「削除」ボタンが有効化される
  btnUpdate.disabled = false;
  btnDelete.disabled = false;
}


// --- 5 メモを更新する ---
async function updateMemo() {
  var id = memoId.value;
  var title = memoTitle.value.trim();
  var body = memoBody.value.trim();

  if (!title || !body) {
    alert("タイトルと本文を入力して下さい");
    return;
  }

  //app.pyのPUT /api/memos<id>に対応
  await fetch("/api/memos/" + id, {
    method: "PUT",
    headers: {
      "Content-Type":"application/json",
    },
    body: JSON.stringify({title:title,body:body}),
  });

  resetForm();
  fetchMemos();
}


// --- 6 メモを削除する ---
async function deleteMemo() {
  var id = memoId.value;

  // confirm():確認ダイアログを表示する
  //「OK」→ true /「NG」→ falseを返す
  if (!confirm("このメモを削除しても良いですか？")) {
    return;
  }

  await fetch("/api/memos/" + id, {
    method:"DELETE",
  });

  resetForm();
  fetchMemos();
}


// --- 7 フォームをリセットする ---
function resetForm() {
  memoId.value = "";
  memoTitle.value = "";
  memoBody.value = "";

  //ボタンの状態を初期状態に戻す
  btnCreate.disabled = false;
  btnUpdate.disabled = true;
  btnDelete.disabled = true;

  //選択状態を解除
  document.querySelectorAll(".memo-card").forEach(function (c) {
    c.classList.remove("selected");
  });
}


// --- 8 イベントリスナーの登録 ---

//フォーム送信（作成ボタン）
memoForm.addEventListener("submit", function (e) {

  //デフォルト動作のキャンセル
  //submitイベントは、デフォルトではページ全体がリロードされる
  e.preventDefault();
  createMemo();
  });

//更新ボタン
btnUpdate.addEventListener("click",updateMemo);

//削除ボタン
btnDelete.addEventListener("click", deleteMemo);

//キャンセルボタン
btnCancel.addEventListener("click",resetForm);

//ページ読み込み時にメモ一覧を取得（ページを開くと、すぐにメモが表示されるようになる）
fetchMemos();
