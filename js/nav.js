"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name, Hack or Snooze */

$body.on("click", "#nav-all", navAllStories);  // When user clicks on the Hack or Snooze nav link. #nav-all is the id for the Hack or Snooze nav link

function navAllStories(evt) {
  console.debug("navAllStories", evt);

  hidePageComponents();

  putStoriesOnPage();
}

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);

  hidePageComponents();

  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);


/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();

  $navLogin.hide();

  $navLogOut.show();

  $navUserProfile.text(`${currentUser.username}`).show();
}


/* When a user clicks on submit, update navbar  */
$navSubmit.on("click", clickOnNavSubmit);

function clickOnNavSubmit(e) {
  $addStoryForm.show();
}








