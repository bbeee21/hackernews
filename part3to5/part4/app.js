const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; 
const store = {
  // page 현재 상태는 전역 변수
  currentPage : 1,
  feeds: [],
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// 글을 읽었는지 안읽었는지 체크
function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

// 글 목록을 불러오는 코드
function newsFeed() {
    
  let newsFeed = store.feeds;
  const newsList =  [];

  // 가변 값이기 때문에 let으로 설정
  let template = `
    <div class="bg-gray-600 min-h-screen">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                Previous
              </a>
              <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                Next
              </a>
            </div>
          </div> 
        </div>
      </div>
      <div class="p-4 text-2xl text-gray-700">
        {{__news_feed__}}        
      </div>
    </div>
  `;

  if (newsFeed.length === 0) {
    // js 문법(★★★★☆)
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }
  
  
  for(let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    // const div = document.createElement('div');
    newsList.push(`
      <div class="p-6 ${newsFeed[i].read ? 'bg-red-500' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-2"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-2"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-2"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>
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

  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;


  // 클릭해서 상세 내용을 보고 나면, 글 읽었는지 체크
  for(let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  // 재귀 호출, 댓글 표시

  function makeComment(comments, called = 0) {
    const commentString = [];

    for(let i=0; i < comments.length; i++) {
      commentString.push(`
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>
      `);
      
      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1));
      }
    }

    return commentString.join('');
  }



  container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments));

}


// console.log(newsFeed);
// console.log(newsFeed.length);


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
