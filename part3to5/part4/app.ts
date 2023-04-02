// type 정의

type Store = {
  currentPage: number;
  feeds: NewsFeed[];
}

// 중복 공통요소 - 인터섹션 이용
type News = {
  id: number;
  time_ago: string;
  title: string;
  url: string;
  user: string;
  content: string;

}

type NewsFeed = News & {
  comments_count: number;
  points: number;
  read?: boolean;
}

type NewsDetail = News & {
  comments: [];
}

type NewsComment = News & {
  comments: [];
  level: number;
}


const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json'; 
const store: Store = {
  // page 현재 상태는 전역 변수
  currentPage : 1,
  feeds: [],
};

// 제네릭 사용 (2가지 타입을 리턴하기 때문)
// 입력 A -> 출력 A , 입력 B -> 출력 B
// AjaxResponse : 이름은 작명 가능

// function getData(url: string):  NewsFeed[] | NewsDetail {
//   ajax.open('GET', url, false);
//   ajax.send();

//   return JSON.parse(ajax.response);
// }

function getData<AjaxResponse>(url: string):  AjaxResponse {
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

// 글을 읽었는지 안읽었는지 체크
function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}


// view 갱신, type guard 역할
function updateView(html: string): void {
  if (container) {
    container.innerHTML = html;
  } else {
    console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.');
  }
}

// 글 목록을 불러오는 코드
function newsFeed(): void {
    
  let newsFeed: NewsFeed[] = store.feeds;
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
    // 호출하는 쪽에서 유형을 명시해주면, 그 유형을 받아서 getData에서 받아서 사용
    newsFeed = store.feeds = makeFeeds(getData<NewsFeed[]>(NEWS_URL));
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
  template = template.replace('{{__prev_page__}}', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
  template = template.replace('{{__next_page__}}', String(store.currentPage + 1));
  // 배열을 하나의 문자열로 합치는 작업

  // 방어 코드 + 삼항 연산자 활용
  
  
  // ts에서 container가 null 값이 있는 경우, 해당 속성이 없음 innerHTML
  updateView(template)
  
  // container.appendChild(ul);
  // container.appendChild(content);
  
}


// 글 내용을 불러오는 코드
function newsDetail() {

  const id = location.hash.substr(7);

  const newsContent = getData<NewsDetail>(CONTENT_URL.replace('@id', id));

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

  
  updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)));

}

// 재귀 호출, 댓글 표시
function makeComment(comments: NewsComment[]): string {
  const commentString = [];

  for(let i=0; i < comments.length; i++) {

    const comment: NewsComment = comments[i];

    commentString.push(`
      <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
        <div class="text-gray-400">
          <i class="fa fa-sort-up mr-2"></i>
          <strong>${comment.user}</strong> ${comment.time_ago}
        </div>
        <p class="text-gray-700">${comment.content}</p>
      </div>
    `);
    
    if (comment.comments.length > 0) {
      commentString.push(makeComment(comment.comments));
    }
  }

  return commentString.join('');
}



// router : 화면처리기 생성
function router() : void{
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
