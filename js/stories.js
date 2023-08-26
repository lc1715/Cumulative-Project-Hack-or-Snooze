
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
 * A render method to render HTML for an individual Story instance  // to show the Story object to the user. the render function will make your HTML code display on the webpage (UI) so that the user can see it
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteButton = false) {

  const hostName = story.getHostName();

  const showStar = Boolean(currentUser)

  return $(`                                        
      <li id="${story.storyId}">              

      ${showDeleteButton ? showTrashCanHTML() : ''}

      ${showStar ? showStarIconHTML(story, currentUser) : ''}  

        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>

      </li>
    `);
}


// To show the trash can icon on the my stories page:
function showTrashCanHTML() {

  return `<span class='trash-can'><i class="fas fa-trash-alt"></i></span>`

}


// To show the star icon on every page and make it either a clear or black star:
function showStarIconHTML(story, currentUser) {

  const isFavoriteStoryFuncTrueOrFalse = currentUser.isFavoriteStory(story)

  const starType = isFavoriteStoryFuncTrueOrFalse ? 'fas' : 'far'

  return `<span class='star'> <i class="${starType} fa-star"></i></span>`
}


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();
  $favoriteStoriesList.empty();
  $myStoriesList.empty()

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {

    const $story = generateStoryMarkup(story);

    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}


/* When a user wants to submit a story into the my stories page and the Hack or Snooze front page */
$addStoryForm.on('submit', submitStory)

async function submitStory(e) {
  console.debug('submitStory')
  e.preventDefault()

  let titleOfStory = $('#title').val()
  let authorOfStory = $('#author').val()
  let urlForStory = $('#url').val()

  await storyList.addStory(currentUser,
    { title: titleOfStory, author: authorOfStory, url: urlForStory });


  $('#title').val('')
  $('#author').val('')
  $('#url').val('')

  putStoriesOnPage()

  location.reload()
}

// To show the my stories page:
$navMyStories.on('click', clickToShowMyStoriesPage)

async function clickToShowMyStoriesPage() {

  $allStoriesList.empty();
  $favoriteStoriesList.empty()
  $myStoriesList.empty()

  // Returns currentUser
  await checkForRememberedUser()

  let myStories = currentUser.ownStories


  for (let story of myStories) {

    let myStory = generateStoryMarkup(story, true)

    $myStoriesList.append(myStory)
  }

  $myStoriesList.show()
}

// Remove a story from my stories:
$myStoriesList.on('click', '.trash-can', clickToRemoveMyStory)


async function clickToRemoveMyStory(e) {

  const $target = $(e.target)
  const $li = $target.closest('li')
  const $storyId = $li.attr('id')

  // Delete the story that you clicked on from the StoryList class, storyList.stories array.
  storyList.stories = storyList.stories.filter(obj => obj.storyId !== $storyId)

  // Delete the story from the User class, favorites array, and the User class, ownStories array.
  currentUser.favorites.filter(obj => obj.storyId !== $storyId)
  currentUser.ownStories.filter(obj => obj.storyId !== $storyId)

  await removeStoryFromMyStories($storyId)
}

// Delete the story from the API server:
async function removeStoryFromMyStories(storyId) {

  await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${storyId}?token=${currentUser.loginToken}`)
}
