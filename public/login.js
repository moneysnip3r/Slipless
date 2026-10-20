// login.js: logic for login.html
// The scripts load at the bottom of the page, so the elements below already exist.

// If the user is already signed in, skip this page (function lives in auth-guard.js)
redirectIfSignedIn();

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const loginButton = document.getElementById("login-button");
const googleButton = document.getElementById("google-login-button");
const loginTagline = document.getElementById("login-tagline");
const loginError = document.getElementById("login-error");

// Shows the error banner, hides the tagline, and marks both fields red
function showLoginError() {
    loginTagline.hidden = true;
    loginError.hidden = false;
    emailInput.classList.add("input-error");
    passwordInput.classList.add("input-error");
}

// Puts the screen back to normal before each attempt
function hideLoginError() {
    loginTagline.hidden = false;
    loginError.hidden = true;
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
}

// Runs when the form is submitted (button click or Enter key)
async function handleLogin(event) {
    event.preventDefault(); // stops the browser reloading the page
    hideLoginError();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // Empty fields count as a failed login
    if (!email || !password) {
        showLoginError();
        return;
    }

    // Disable the button while the request runs so it can't be pressed twice
    loginButton.disabled = true;

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) {
            showLoginError();
        } else {
            window.location.replace("tours_list.html");
        }
    } catch (error) {
        showLoginError();
    } finally {
        loginButton.disabled = false;
    }
}

// Sends the user to Google, which then returns them to tours_list.html
async function handleGoogleLogin() {
    hideLoginError();

    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: new URL("tours_list.html", window.location.href).href
        }
    });

    if (error) {
        showLoginError();
    }
}

loginForm.addEventListener("submit", handleLogin);
googleButton.addEventListener("click", handleGoogleLogin);