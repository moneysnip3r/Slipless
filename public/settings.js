// settings.js: logic for settings.html
// The scripts load at the bottom of the page, so the elements below already exist.

// Protected page: if signed out, send the user to login (function lives in auth-guard.js)
redirectIfSignedOut();

const settingsLoading = document.getElementById("settings-loading");
const settingsMessage = document.getElementById("settings-message");
const settingsForm = document.getElementById("settings-form");
const nameInput = document.getElementById("settings-name");
const businessInput = document.getElementById("settings-business");
const phoneInput = document.getElementById("settings-phone");
const emailInput = document.getElementById("settings-email");
const bankingInput = document.getElementById("settings-banking");
const saveButton = document.getElementById("save-button");
const signoutButton = document.getElementById("signout-button");

// The signed-in user, set when the profile loads
let currentUser = null;

// Shows a message under the title. isError picks the red or the success style.
function showSettingsMessage(text, isError) {
    settingsMessage.textContent = text;
    settingsMessage.classList.toggle("form-message-error", isError);
    settingsMessage.classList.toggle("form-message-success", !isError);
    settingsMessage.hidden = false;
}

function hideSettingsMessage() {
    settingsMessage.hidden = true;
    nameInput.classList.remove("input-error");
}

// Fills the form with the saved profile
async function loadProfile() {
    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();
        currentUser = sessionData.session ? sessionData.session.user : null;

        // No session: redirectIfSignedOut is already sending the user to login
        if (!currentUser) return;

        emailInput.value = currentUser.email;

        const { data, error } = await supabaseClient
            .from("profiles")
            .select("full_name, business_name, phone, banking_details")
            .eq("id", currentUser.id)
            .maybeSingle(); // returns null instead of an error when there is no row yet

        if (error) throw error;

        // No row yet (for example a first Google sign-in): fall back to the name on the account
        const profile = data || {};
        const accountName = currentUser.user_metadata ? currentUser.user_metadata.full_name : "";

        nameInput.value = profile.full_name || accountName || "";
        businessInput.value = profile.business_name || "";
        phoneInput.value = profile.phone || "";
        bankingInput.value = profile.banking_details || "";

        settingsLoading.hidden = true;
        settingsForm.hidden = false;
    } catch (error) {
        settingsLoading.hidden = true;
        showSettingsMessage("Couldn't load your profile. Refresh the page and try again.", true);
    }
}

// Runs when the form is submitted (button click or Enter key)
async function handleSaveProfile(event) {
    event.preventDefault(); // stops the browser reloading the page
    hideSettingsMessage();

    if (!currentUser) return;

    const fullName = nameInput.value.trim();

    // Full name is the only required field
    if (!fullName) {
        nameInput.classList.add("input-error");
        showSettingsMessage("Full name is required.", true);
        return;
    }

    // Disable the button while the request runs so it can't be pressed twice
    saveButton.disabled = true;

    try {
        // upsert updates the row, or creates it if it doesn't exist yet. Empty optional fields are saved as null.
        const { error } = await supabaseClient.from("profiles").upsert({
            id: currentUser.id,
            full_name: fullName,
            business_name: businessInput.value.trim() || null,
            phone: phoneInput.value.trim() || null,
            banking_details: bankingInput.value.trim() || null
        });

        if (error) throw error;

        showSettingsMessage("Saved.", false);
    } catch (error) {
        showSettingsMessage("Couldn't save your changes. Try again.", true);
    } finally {
        saveButton.disabled = false;
    }
}

// Signs the user out, then sends them to login
async function handleSignOut() {
    await supabaseClient.auth.signOut();
    window.location.replace("login.html");
}

settingsForm.addEventListener("submit", handleSaveProfile);
signoutButton.addEventListener("click", handleSignOut);

loadProfile();