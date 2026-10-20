// auth-guard.js: checks whether the user is signed in and redirects if they are on the wrong page.
// Loads after supabase-client.js. Page scripts call one of the two functions at the very top:
//   redirectIfSignedOut()  protected pages (tours_list, settings)
//   redirectIfSignedIn()   login and signup

// True if there is a signed-in session. Any failure counts as signed out.
async function hasSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        return Boolean(data.session);
    } catch (error) {
        return false;
    }
}

// replace() instead of href so the Back button doesn't return to the page the user was bounced from
async function checkSignedOut() {
    if (!(await hasSession())) {
        window.location.replace("login.html");
    }
}

async function checkSignedIn() {
    if (await hasSession()) {
        window.location.replace("tours_list.html");
    }
}

// For protected pages: send signed-out users to login
function redirectIfSignedOut() {
    checkSignedOut();

    // When the user presses Back, the browser can restore the page from memory without
    // running the scripts again. Check again so a signed-out user can't see a protected page.
    window.addEventListener("pageshow", function (event) {
        if (event.persisted) checkSignedOut();
    });
}

// For login and signup: send signed-in users to the Tours list
function redirectIfSignedIn() {
    checkSignedIn();

    window.addEventListener("pageshow", function (event) {
        if (event.persisted) checkSignedIn();
    });
}