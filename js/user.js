
"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */
$loginForm.on("submit", login);

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

/** Handle signup form submission. */
$signupForm.on("submit", signup);

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();

  $signupForm.trigger("reset");
}


/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}


/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");

  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();

  $addStoryForm.hide()
}


// Click on a star to get that specific storyId to add a favorite story or to remove a favorite story:
$storiesLists.on('click', '.star', clickToAddOrRemoveFavoriteStory)

async function clickToAddOrRemoveFavoriteStory(e) {

  const $tgt = $(e.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");

  let listOfStories = await StoryList.getStories()

  const story = listOfStories.stories.find(obj => obj.storyId === storyId)

  if ($tgt.hasClass('far')) {
    await addFavoriteStory(story)
    $tgt.closest('i').toggleClass('far fas')
  } else {
    await removeFavoriteStory(story)
    $tgt.closest('i').toggleClass('far fas')

  }
}


// To add a favorite story to my favorites page in the server:
async function addFavoriteStory(story) {

  await checkForRememberedUser()

  currentUser.favorites.push(story)

  await axios.post(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${story.storyId}`, {
    "token": currentUser.loginToken
  })
}

// To show the favorite stories page:
$navFavorites.on('click', showFavoritesPage)

async function showFavoritesPage(e) {

  $allStoriesList.empty();
  $myStoriesList.empty();
  $favoriteStoriesList.empty()

  for (let favorite of currentUser.favorites) {
    let $favoriteStory = generateStoryMarkup(favorite)
    $favoriteStoriesList.append($favoriteStory);
  }

  $favoriteStoriesList.show()
}


// To remove a favorite story:
async function removeFavoriteStory(story) {

  await checkForRememberedUser()

  currentUser.favorites = currentUser.favorites.filter(obj => obj.storyId !== story.storyId);

  await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${story.storyId}?token=${currentUser.loginToken}`)
}

