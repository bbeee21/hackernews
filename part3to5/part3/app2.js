const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; 
const store = {
  // page 현재 상태는 전역 변수
  currentPage : 1,
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// 글 목록을 불러오는 코드
function newsFeed() {
    
  const newsFeed = getData(NEWS_URL);
  const newsList =  [];

  // 가변 값이기 때문에 let으로 설정
  let template = `
    <div class="container mx-auto p-4">
      <h1>Hacker News</h1>
      <ul>
        {{__news_feed__}}
      </ul>
      <div class="test underline">
        <a href="#/page/{{__prev_page__}}">이전 페이지</a>
        <a href="#/page/{{__next_page__}}">다음 페이지</a>
      </div>
    </div>
  `;

  
  
  for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    // const div = document.createElement('div');
    newsList.push(`
      <li>
        <a href="#/show/${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
    
    // ul.appendChild(div.children[0]);
    // ul.appendChild(div.firstElementChild);
  }
  
  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1);
  template = template.replace('{{__next_page__}}', store.currentPage + 1);
  // 배열을 하나의 문자열로 합치는 작업

  // 방어 코드 + 삼항 연산자 활용
  
  
  container.innerHTML = template;
  // container.appendChild(ul);
  // container.appendChild(content);
  
}


// 글 내용을 불러오는 코드
function newsDetail() {
  
  const id = location.hash.substr(7);

  const newsContent = getData(CONTENT_URL.replace('@id', id));

  container.innerHTML = `
    <h1>${newsContent.title}</h1>

    <div>
      <a href="#/page/${store.currentPage}">목록으로</a>
    </div>
  
  `

}
const ul = document.createElement('ul');

// console.log(newsFeed);
console.log(newsFeed.length);


// router : 화면처리기 생성
function router() {
  const routePath = location.hash;

  if(routePath === '') {
    // 글 목록, # 값이 들어온 경우 빈값으로 판단함
    newsFeed();
  } else if(routePath.indexOf('#/page/') >= 0){
    // 글 세부 내용 : page

    // substr => 문자열로 반환 
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    // 글 세부 내용 : show
    newsDetail();
  }
}

// hash값이 변경되는 경우 : 메뉴 이동 , 글 내용 이동 (2가지() -> 라우터에서 처리
window.addEventListener('hashchange', router);

router();
