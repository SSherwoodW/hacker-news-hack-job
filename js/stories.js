"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteButton = false) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
  <li id="${story.storyId}">
  ${showDeleteButton ? getDeleteButtonHTML() : ""}
  ${showStar ? generateStarMarkup(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function generateStarMarkup (story, user) {
  const isFavorite = user.isFavorite(story);
  const starFill = isFavorite ? "fas" : "far";
  return `
  <span class="star"> 
    <i class="${starFill} fa-star"></i>
  </span>`;
}

function getDeleteButtonHTML(){
  return `<span class ="garbage-can">
  <i class="fas fa-trash-alt"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitStoryToPage (evt) {
  console.debug("submitStoryToPage", evt);
  evt.preventDefault();

  const username = currentUser.username;
  
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();

  const storyData = {title, url, author, username}

  const story = storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  $userStoriesList.append($story);

  $allStoriesList.show();

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitStoryToPage);


async function deleteStoryFromPage (evt) {
  console.debug("deleteStoryFromPage");
  const $closest = $(evt.target).closest('li');
  const storyId = $closest.attr('id');
  
  await storyList.removeStory(currentUser, storyId);
  await putUserStoriesOnPage();
}
$userStoriesList.on("click", ".garbage-can", deleteStoryFromPage);


//***********favorite/unfavorite stories */

function putFavoriteStoriesOnPage () {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStories.empty();
  hidePageComponents();

  if(currentUser.favorites.length === 0){
    $favoriteStories.append("<h4>No favorites added!</h4>")
  } else {
    for(let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $favoriteStories.append($story);
    }
    $favoriteStories.remove("h4");
  }

  $favoriteStories.show();
}


async function favoriteUnfavorite(evt){
  console.debug('favoriteUnfavorite');

  const $target = $(evt.target);
  const $tgtStory = $target.closest("li");
  const storyId = $tgtStory.attr("id");
  const story = storyList.stories.find(story => story.storyId === storyId);

  if($target.hasClass("fas")){
    await currentUser.removeFavorite(story)
    $target.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".star", favoriteUnfavorite);


function putUserStoriesOnPage(){
  console.debug('putUserStoriesOnPage');
  

  $userStoriesList.empty();

  if(currentUser.ownStories.length === 0){
    $userStoriesList.append("<h4>No stories added by user!<h4>");
  } else {
    for(let story of currentUser.ownStories){
      let $story = generateStoryMarkup(story, true);
      $userStoriesList.append($story);
    }
    $userStoriesList.remove('h4');
  }
  $userStoriesList.show();
}