'use strict';

// this function fetches category and inserts them
// Main function is called on document load
window.addEventListener('load', () => {
  main();
});

function main() {
  const categoryURL =
    'https://openapi.programming-hero.com/api/news/categories';

  // https://openapi.programming-hero.com/api/news/{news_id}

  fetch(categoryURL)
    .then((res) => res.json())
    .then((data) => {
      const categories = data.data.news_category;
      insertCategory(categories);
    });
}

// this function inserts categories in categoryContainer
function insertCategory(categories) {
  //select the container to add category
  const categoryContainer = document.getElementById('category-container');
  console.log(categoryContainer);
  const htmlStr = categories
    .map((category) => {
      // active-category
      return `<li
        class="
          font-semibold
          opacity-80
          py-1
          px-2
          rounded-sm
          hover:text-primary
          hover:cursor-pointer
        "
      >
      <a href="javascript:void(0)" data-id=${category.category_id}>${category.category_name}</a>
      </li>`;
    })
    .join('');

  categoryContainer.innerHTML = htmlStr;

  // add and event listener to category container
  // so any category click will work
  categoryContainer.addEventListener('click', (event) => {
    // guard clause
    // if a element wasn't clicked do nothing
    if (!event.target.matches('a')) return;

    //setting active class
    const a = event.target;
    const li = a.parentElement;
    Array.from(categoryContainer.children).forEach((elem) =>
      elem.classList.remove('active-category')
    );
    li.classList.add('active-category');

    // based on category enter data as card
    // into card container
    const id = event.target.getAttribute('data-id');
    const url = `https://openapi.programming-hero.com/api/news/category/${id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const cardItemsArr = data.data;

        //insert category count
        const categoryItemsCount = document.getElementById(
          'category_items_count'
        );
        categoryItemsCount.textContent = `${cardItemsArr.length} items available`;

        // insert card items
        // this is a long task so calling a function
        // function parameter : card items array
        insertCardItems(cardItemsArr);
      });
  });
}

// Select card container as global because we will need it later on
const cardContainer = document.getElementById('card-container');
function insertCardItems(cardItemsArray) {
  cardContainer.innerHTML = '';

  //sort card items based on views
  const sortedItems = cardItemsArray.sort((a, b) => {
    //if view is null then view is 0
    return (b.total_view || 0) - (a.total_view || 0);
  });

  // loopover the sorted array to insert each item into card container
  for (const item of sortedItems) {
    const html = `
          <div
          class="flex flex-col sm:flex-row gap-4 bg-base-100 rounded-lg shadow-lg"
          data-todays-pick="${item.others_info.is_todays_pick ? 1 : 0}"
          data-trending="${item.others_info.is_trending ? 1 : 0}"
        >
          <!-- card image -->
          <div class="p-4 flex-[3]">
            <figure class="overflow-hidden rounded-lg">
              <img
                src="https://i.ibb.co/BZZ5WKv/unsplash-Eh-Tc-C9s-YXsw-4.png"
                alt="Movie"
                class="w-full"
              />
            </figure>
          </div>
        
          <!-- card other things -->
          <div class="p-4 flex-[6] flex flex-col">
            <!-- card title -->
            <h2 class="card-title">${item.title}</h2>
            <!-- card description -->
            <p class="grow">${
              item.details.length > 100
                ? `${item.details.substring(0, 100)} ...Read More`
                : item.details.length
            }</p>
            <div class="flex flex-wrap justify-between items-center mt-8">

              <!-- author -->
              <div class="flex gap-2 items-center">
                <div class="avatar">
                  <div class="w-12 rounded-full">
                    <img src="${item.author.img}" />
                  </div>
                </div>
                <div class="flex flex-col justify-center">
                  <p>${item.author.name || 'Unknown Author'}</p>
                  <small class="opacity-60"
                    >${item.author.published_date.substring(0, 10)}</small
                  >
                </div>
              </div>
              <!-- author end -->
        
              <!-- viwers -->
              <div class="flex items-center justify-center gap-2">
                <i class="fa-solid fa-eye fa-lg mt-1"></i>
                <p>${item.total_view || 0}</p>
              </div>
              <!-- viewers end -->
        
              <!-- rating -->
              <div class="flex items-center justify-center">
                <!-- <i class="fa-solid fa-star"></i> -->
                <i class="fa-solid fa-star-half-stroke"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
                <i class="fa-regular fa-star"></i>
              </div>
              <!-- rating end -->
        
              <!-- more info maybe -->
              <button
                class="card-btn btn btn-primary btn-outline btn-circle"
                data-news-id="${item._id}"
              >
                <i class="fa-solid fa-arrow-right fa-2xl pointer-events-none"></i>
              </button>
            </div>
          </div>
        </div>
      `;

    cardContainer.innerHTML += html;
  }
}

// Show card Item based on which
// button is selected
// example Today's pick is selected
// so we will show only todays data and hide the rest
const todayPickBtn = document.getElementById('todays_pick_btn');
const trendingBtn = document.getElementById('trending_btn');
todayPickBtn.addEventListener('click', () => {
  // toggling active styles
  trendingBtn.classList.add('btn-outline');
  todayPickBtn.classList.remove('btn-outline');

  // call the function with correct prop
  showItemBasedOnProp('todays-pick');
});
trendingBtn.addEventListener('click', () => {
  //toggling active styles
  todayPickBtn.classList.add('btn-outline');
  trendingBtn.classList.remove('btn-outline');

  // call the function with correct prop
  showItemBasedOnProp('trending');
});

const showItemBasedOnProp = (prop) => {
  // select all items there is in a card container
  // we will not remove any element from DOM
  // we will just hide it with css
  const cardArray = Array.from(cardContainer.children);
  cardArray.forEach((card) => {
    const value = card.getAttribute(`data-${prop}`);
    if (value == 0) {
      card.style.display = 'none';
    } else {
      card.style = '';
    }
  });
};

// add a click event to card container
// so that we can work with any card item click
// and we won't have to add event listener to every item
cardContainer.addEventListener('click', cardEventHandler);

// card event
// we want to add some data in a modal
// then show that modal on card click event
function cardEventHandler(event) {
  // guard clause
  // check if the click happened on Desired button
  // Desired button also has an I tag inside, so
  // we are checking if the click in either of them
  if (event.target.tagName !== 'BUTTON') return;

  //DO something else
  const id = event.target.getAttribute('data-news-id');
  const url = `https://openapi.programming-hero.com/api/news/${id}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const newsData = data.data[0];

      // insert desired data into the modal
      insertModalData(newsData);
    });
}

// insert modal data
function insertModalData(newsData) {
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modal-content-box');

  //insert data into modal
  const html = `
    <div class="card card-compact w-full glass">
    <figure><img src="${newsData.image_url}" alt="news-image"></figure>
    <div class="card-body">
      <h2 class="card-title">${newsData.title}</h2>
      <p class="text-xs sm:text-sm md:text-md">${newsData.details}</p>
      <div class="modal-action justify-end">
        <button id="modal-action-btn" class="btn btn-primary">Close</button>
      </div>
    </div>
  </div>
    `;
  modalContent.innerHTML = html;

  //open modal
  modal.classList.add('modal-open');

  // add event listener to action button
  const modalActionBtn = document.getElementById('modal-action-btn');
  modalActionBtn.addEventListener(
    'click',
    () => {
      modal.classList.remove('modal-open');
    },
    { once: true }
  );
}

//   author:
// img: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&w=1000&q=80"
// name: "Jennifer Wood"
// published_date: "2022-08-30 16:38:45"
// [[Prototype]]: Object
// category_id: "02"
// details: "Tucker Carlson has rarely met a dictator's ass he didn't want to kiss, and Vladimir Putin is at the very top of that puckering up list. The Fox News host is something of a folk hero in Russia: Because of the pro-Putin propaganda he so often spews, the Kremlin has encouraged Russia's state TV to air as much of Tucker's face as possible — and they're certain to love his latest rant about how Putin is winning the war in Ukraine, which does not seem to be the case. But on Fox News, what Tucker says goes."
// image_url: "https://i.ibb.co/BZZ5WKv/unsplash-Eh-Tc-C9s-YXsw-4.png"
// others_info:
// is_todays_pick: false
// is_trending: true
// [[Prototype]]: Object
// rating:
// badge: "Excellent"
// number: 4.3
// [[Prototype]]: Object
// thumbnail_url: "https://i.ibb.co/k8XBcMX/unsplash-Eh-Tc-C9s-YXsw-15.png"
// title: "Tucker Carlson Swears Vladimir Putin Is Winning The War In Ukraine"
// total_view: 400
// _id: "f69a695f037cd9484cecaea37ca71012"
