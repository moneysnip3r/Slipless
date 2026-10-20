// signup.js: logic for signup.html
// The scripts load at the bottom of the page, so the elements below already exist.

// If the user is already signed in, skip this page (function lives in auth-guard.js)
redirectIfSignedIn();

const signupForm = document.getElementById("signup-form");
const nameInput = document.getElementById("signup-name");
const emailInput = document.getElementById("signup-email");
const passwordInput = document.getElementById("signup-password");
const signupButton = document.getElementById("signup-button");
const googleButton = document.getElementById("google-signup-button");
const signupError = document.getElementById("signup-error");
const signupErrorTitle = document.getElementById("signup-error-title");
const signupErrorMessage = document.getElementById("signup-error-message");

// Shows the banner with a title and message
function showSignupMessage(title, message) {
    signupErrorTitle.textContent = title;
    signupErrorMessage.textContent = message;
    signupError.hidden = false;
}

// Puts the screen back to normal before each attempt
function hideSignupMessage() {
    signupError.hidden = true;
    nameInput.classList.remove("input-error");
    emailInput.classList.remove("input-error");
    passwordInput.classList.remove("input-error");
}

// Runs when the form is submitted (button click or Enter key)
async function handleSignup(event) {
    event.preventDefault(); // stops the browser reloading the page
    hideSignupMessage();

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // All three fields are required
    if (!fullName || !email || !password) {
        if (!fullName) nameInput.classList.add("input-error");
        if (!email) emailInput.classList.add("input-error");
        if (!password) passwordInput.classList.add("input-error");
        showSignupMessage("Can't create account", "Fill in all the fields.");
        return;
    }

    // Minimum password length, matching the hint under the field
    if (password.length < 8) {
        passwordInput.classList.add("input-error");
        showSignupMessage("Can't create account", "Password must be at least 8 characters.");
        return;
    }

    // Disable the button while the request runs so it can't be pressed twice
    signupButton.disabled = true;

    try {
        // The full name is saved on the account itself as well
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } }
        });

        if (error) {
            if (error.message.toLowerCase().includes("already")) {
                emailInput.classList.add("input-error");
                showSignupMessage("Can't create account", "An account with this email already exists. Try logging in.");
            } else {
                showSignupMessage("Can't create account", "Something went wrong. Try again.");
            }
            return;
        }

        // No session means Supabase is waiting for the email to be confirmed.
        // This only happens if email confirmation is switched on in Supabase.
        if (!data.session) {
            showSignupMessage("Check your email", "We sent a confirmation link to " + email + ". Confirm it, then log in.");
            return;
        }

        // Create the profile row. If this fails the account still exists,
        // and the settings page creates the row the first time the profile is saved.
        await supabaseClient.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName
        });

        window.location.replace("tours_list.html");
    } catch (error) {
        showSignupMessage("Can't create account", "Something went wrong. Try again.");
    } finally {
        signupButton.disabled = false;
    }
}

// Sends the user to Google, which then returns them to tours_list.html
async function handleGoogleSignup() {
    hideSignupMessage();

    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: new URL("tours_list.html", window.location.href).href
        }
    });

    if (error) {
        showSignupMessage("Can't create account", "Google sign-up didn't work. Try again.");
    }
}

signupForm.addEventListener("submit", handleSignup);
googleButton.addEventListener("click", handleGoogleSignup);