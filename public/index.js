// index.js: logic for index.html
// index.html has no screen. It checks the session and sends the user to the right page.

async function routeUser() {
    try {
        const { data } = await supabaseClient.auth.getSession();

        // replace() instead of href so the Back button doesn't return to this blank page
        if (data.session) {
            window.location.replace("tours_list.html");
        } else {
            window.location.replace("login.html");
        }
    } catch (error) {
        // If the session can't be checked, treat the user as signed out
        window.location.replace("login.html");
    }
}

routeUser();