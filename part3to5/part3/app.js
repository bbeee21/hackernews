const ajax = new XMLHttpRequest();

ajax.open('GET', 'https://api.hnpwa.com/v0/news/1.json', false);
ajax.send();

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul');

console.log(newsFeed);
console.log(newsFeed.length);

for(let i=0; i < newsFeed.length ; i++) {
  const li = document.createElement('li');

  li.innerHTML = newsFeed[i].title;

  ul.appendChild(li);
}

document.getElementById('root').appendChild(ul);

// document.getElementById('root').innerHTML = `<ul>
//   <li>${newsFeed[0].title}</li>
//   <li>${newsFeed[1].title}</li>
//   <li>${newsFeed[2].title}</li>
// </ul>`;