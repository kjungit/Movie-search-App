const bodyEl = document.querySelector("body");
const inputEl = document.querySelector("input");
const buttonEl = document.querySelector(".search-btn");
const moviesEl = document.querySelector("ul.movies");
const viewMoreEl = document.querySelector(".view-more");
const contentsEl = document.querySelector(".contents-area");
const searchEl = document.querySelector(".search-area");
const spinnerBg = document.querySelector(".spinner-border.bg");
const spinnerDe = document.querySelector(".spinner-border.de");
const spinnerSc = document.querySelector(".spinner-border.sc");
const searchNull = document.querySelector(".search-null");
const toTopEl = document.querySelector(".to-top");

// 새로운 페이지 배열
let newPage = [];

let id = "";
let type = "movie";
let page = 1;
let totalpage = 0;
let OMDB_API_KEY = "7035c60c";

// input창에 입력했을 때 id값 할당
inputEl.addEventListener("input", function () {
  id = inputEl.value;
});

// Enter키로 검색
inputEl.addEventListener("keydown", async function (event) {
  if (event.key === "Enter" && !event.isComposing) {
    spinnerBg.style.display = "block";
    // page를 1로 불러오기
    page = 1;
    // 영화정보 호출

    const movies = await getMovies();
    // 영화정보가 없을 때
    if (movies.Response === "False") {
      spinnerBg.style.display = "none";
      searchNull.style.display = "block";
      searchNull.textContent = "검색결과가 없습니다.";
      moviesEl.style.display = "none";
      return;
    }
    // 영화정보가 있을 때
    moviesEl.style.display = "flex";
    searchNull.style.display = "none";
    // 영화정보로 렌더링 호출
    renderMovies(movies.Search, true);
    spinnerBg.style.display = "none";
    // 스크롤 페이지
    await scrollPage(movies);

    searchEl.className = "search-area active";
    contentsEl.style.display = "flex";
  }
});

// 클릭으로 검색
buttonEl.addEventListener("click", async function () {
  spinnerBg.style.display = "block";
  // page를 1로 불러오기
  page = 1;
  // 영화정보 호출
  const movies = await getMovies();
  // 영화정보가 없을 때
  if (movies.Response === "False") {
    spinnerBg.style.display = "none";
    searchNull.style.display = "block";
    searchNull.textContent = "검색결과가 없습니다.";
    moviesEl.style.display = "none";
    return;
  }
  // 영화정보가 있을 때
  moviesEl.style.display = "flex";
  searchNull.style.display = "none";
  // 영화정보로 렌더링 호출
  renderMovies(movies.Search, true);
  spinnerBg.style.display = "none";
  // 스크롤 페이지
  await scrollPage(movies);

  searchEl.className = "search-area active";
  contentsEl.style.display = "flex";
});

// top으로 이동
toTopEl.addEventListener("click", function () {
  gsap.to(window, 0.1, {
    scrollTo: 0,
  });
});

// 영화 정보 호출
async function getMovies() {
  const json = await fetch(
    `https://omdbapi.com/?apikey=${OMDB_API_KEY}&s=${id}&type=${type}&page=${page}`
  ).then((res) => res.json());
  return json;
}

// 영화 정보를 받아서 메인에 렌더링
function renderMovies(movies, isFirst) {
  const liEls =
    movies &&
    movies.map(function (movie) {
      const frontLiEl = document.createElement("li");
      const backLiEl = document.createElement("li");
      const posterEl = document.createElement("img");
      const titleAreaFront = document.createElement("div");
      const titleElFront = document.createElement("h2");
      const yearEl = document.createElement("div");
      const titleAreaBack = document.createElement("div");
      const titleElBack = document.createElement("h2");
      const backPoser = document.createElement("img");
      const viewMoreText = document.createElement("div");
      const imgWrap = document.createElement("div");

      // 이미지 없을 때
      movie.Poster === "N/A"
        ? (posterEl.src = "./assets/img/no-img.jpg")
        : (posterEl.src = movie.Poster);
      movie.Poster === "N/A"
        ? (backPoser.src = "./assets/img/no-img-back.jpg")
        : (backPoser.src = movie.Poster);

      // front El (Flip 애니메이션 앞 요소)
      titleElFront.textContent = movie.Title;
      yearEl.textContent = movie.Year;
      frontLiEl.className = "front";
      backLiEl.className = "back";
      imgWrap.classList = "img-wrap";
      titleAreaFront.className = "title-area-f";
      titleElFront.className = "movie-title-f";
      yearEl.className = "movie-year";

      titleAreaFront.append(titleElFront, yearEl);
      frontLiEl.append(posterEl, titleAreaFront);

      // back El (Flip 애니메이션 뒷 요소)
      titleElBack.textContent = movie.Title;
      viewMoreText.textContent = "View More";
      viewMoreText.className = "view-text";
      titleAreaBack.className = "title-area-b";
      titleElBack.className = "movie-title-b";
      titleAreaBack.append(titleElBack, viewMoreText);
      backLiEl.append(backPoser, titleAreaBack);
      imgWrap.append(frontLiEl, backLiEl);

      // 상세정보창 열기
      imgWrap.addEventListener("click", async function () {
        spinnerDe.style.display = "block";
        bodyEl.style.overflow = "hidden";
        const res = await getDetail(movie.imdbID);
        renderDetail(res);
      });
      return imgWrap;
    });
  if (isFirst) {
    moviesEl.innerHTML = "";
  }
  // 검색결과가 없을 때
  if (movies === undefined) {
    return;
  }

  // 검색결과가 1개 일때
  if (liEls.length === 1) {
    moviesEl.append(liEls[0]);
  } else {
    moviesEl.append(...liEls);
  }
}

// 무한스크롤 구현 (Intersection Observer API)
const option = {
  root: null,
  rootMargin: "0px 0px 0px 0px",
  thredhold: 0,
};
const onIntersect = function (entries) {
  // 페이지가 1개일때
  if (page === totalpage) return;
  // 페이지가 여러개일때 forEach로 순회하며 추가
  entries.forEach(async (entry) => {
    if (entry.isIntersecting) {
      ++page;
      spinnerSc.style.display = "block";

      const movies = await getMovies();
      renderMovies(movies.Search, false);
      newPage = document.querySelectorAll(".title-area-f");
    }
    spinnerSc.style.display = "none";
  });
};
// viewMoreEl요소에 마지막 스크롤 감지
const observer = new IntersectionObserver(onIntersect);
observer.observe(viewMoreEl);

// 실시간 이미지 리사이징
function reSize(url, size = 700) {
  console.log(url == true);
  return url.replace("SX300", `SX${size}`);
}

// 상세페이지 정보
async function getDetail(id) {
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${id}`
  );
  const json = await res.json();
  if (json.Response === "True") {
    return json;
  }
  return json.Error;
}

// 상세페이지 렌더링
function renderDetail(movie) {
  const detailBg = document.createElement("div");
  const detailEl = document.createElement("div");

  const detailPoster = document.createElement("img");
  const deteailArea = document.createElement("div");
  const detailTitle = document.createElement("div");
  const detailReleased = document.createElement("div");
  const detailTime = document.createElement("div");
  const detailGenre = document.createElement("div");
  const detailDirector = document.createElement("div");
  const detailCast = document.createElement("div");
  const detailDemo = document.createElement("div");
  const detailImdbRating = document.createElement("div");

  detailBg.className = "detail-bg";
  detailEl.className = "detail-el";
  deteailArea.className = "detail-area";
  detailPoster.className = "detail-poster";
  detailTitle.className = "detail-title";
  detailReleased.className = "detail-released";
  detailTime.className = "detail-time";
  detailGenre.className = "detail-genre";
  detailDirector.className = "detail-dir";
  detailCast.className = "detail-cast";
  detailDemo.className = "detail-demo";
  detailImdbRating.className = "detail-imdb";

  detailTitle.textContent = movie.Title;

  if (movie.Poster === "N/A") detailPoster.src = "./assets/img/no-img-back.jpg";
  else detailPoster.src = reSize(movie.Poster);

  detailReleased.textContent = movie.Released;
  detailTime.textContent = movie.Runtime;
  detailGenre.textContent = movie.Genre;
  detailDirector.textContent = movie.Director;
  detailCast.textContent = movie.Actors;
  detailDemo.textContent = movie.Plot;
  detailImdbRating.textContent = movie.imdbRating;

  deteailArea.append(
    detailTitle,
    detailPoster,
    detailReleased,
    detailTime,
    detailGenre,
    detailDirector,
    detailCast,
    detailDemo,
    detailImdbRating
  );

  detailEl.append(detailPoster, deteailArea);

  detailBg.append(detailEl);
  document.body.prepend(detailBg);

  // 상세페이지를 닫을 떄
  document.addEventListener("click", (e) => {
    if (e.target.className === "detail-bg") {
      const datileBg = document.querySelector(".detail-bg");
      if (datileBg !== null) {
        bodyEl.style.overflow = "auto";
        datileBg.remove(datileBg);
      }
    }
  });
  spinnerDe.style.display = "none";
}

// 스크롤 페이지
async function scrollPage() {
  const movies = await getMovies();
  const page = parseInt(movies.totalResults, 10);
  totalpage = Math.ceil(page / 10);
}

// [유효성 검증 함수]: n개의 글자 이상
function moreThanLength(str, n) {
  return str.length >= n;
}
function onlyNumberAndEnglish(str) {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(str);
}

// [시각적 피드백]: 에러메시지를 띄웁니다
function displayErrorMessage(message) {
  elErrorMessage.classList.add("show");
  elErrorMessage.textContent = message;
}

// 글자수 제한
const inputform = document.querySelector("label");
inputform.addEventListener("input", (el) => {
  const inputText = el.target.closest('input[type="text"]').value;
  if (moreThanLength(inputText, 3) && onlyNumberAndEnglish(inputText)) {
    inputform.classList.add("valid");
    const iClass = inputform.querySelector("i");
    iClass.nextSibling.textContent = "";
  } else {
    if (inputform.classList.item === "valid") {
      inputform.classList.remove("valid");
    }
    inputform.classList.add("invalid");
    const iClass = inputform.querySelector("i");
    iClass.nextSibling.textContent = "📌 3자 이상 영어를 입력해주세요.";
  }
});
