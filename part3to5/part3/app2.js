const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// 글 목록을 불러오는 코드
function newsFeed() {
    
  const newsFeed = getData(NEWS_URL);
  const newsList =  [];

  newsList.push('<ul>');
  
  
  for(let i=0; i < 10; i++) {
    // const div = document.createElement('div');
  
  
    newsList.push(`
      <li>
        <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
        </a>
      </li>
    `);
  
    // ul.appendChild(div.children[0]);
    // ul.appendChild(div.firstElementChild);
  }
  
  newsList.push('</ul>');
  
  // 배열을 하나의 문자열로 합치는 작업
  
  
  container.innerHTML = newsList.join('');
  // container.appendChild(ul);
  // container.appendChild(content);
  
}


// 글 내용을 불러오는 코드
function newsDetail() {
  const id = location.hash.substr(1);

  const newsContent = getData(CONTENT_URL.replace('@id', id));

  container.innerHTML = `
    <h1>${newsContent.title}</h1>

    <div>
      <a href="#">목록으로</a>
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
  } else {
    // 글 세부 내용
    newsDetail();
  }
}

// hash값이 변경되는 경우 : 메뉴 이동 , 글 내용 이동 (2가지() -> 라우터에서 처리
window.addEventListener('hashchange', router);

router();
