// tours_list.js: logic for tours_list.html
// The scripts load at the bottom of the page, so the elements below already exist.

// Protected page: if signed out, send the user to login (function lives in auth-guard.js)
redirectIfSignedOut();

const toursLoading = document.getElementById("tours-loading");
const toursError = document.getElementById("tours-error");
const toursEmpty = document.getElementById("tours-empty");
const toursList = document.getElementById("tours-list");

// Makes an element with plain text. textContent is used instead of innerHTML
// so a tour title can never be read as HTML.
function createTextElement(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
}

// "2026-03-28" becomes a date in the user's own format. The time is added
// so the date doesn't shift a day because of the time zone.
function formatDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString();
}

// "in_progress" becomes "in progress"
function formatStatus(status) {
    return status ? status.replace(/_/g, " ") : "";
}

// Builds one tour card. It links to the tour detail page (page not created yet),
// passing the tour's id in the address.
function createTourCard(tour) {
    const item = document.createElement("li");

    const link = document.createElement("a");
    link.href = "tour_detail.html?id=" + encodeURIComponent(tour.id);
    link.className = "tour-card";

    link.appendChild(createTextElement("h2", tour.title, "tour-title"));
    link.appendChild(createTextElement("p", tour.client_name, "tour-client"));

    // End date is optional
    let dates = formatDate(tour.start_date);
    if (tour.end_date) dates += " - " + formatDate(tour.end_date);
    link.appendChild(createTextElement("p", dates, "tour-dates"));

    link.appendChild(createTextElement("span", formatStatus(tour.status), "tour-status"));

    item.appendChild(link);
    return item;
}

// Loads the guide's tours, newest first
async function loadTours() {
    try {
        const { data: sessionData } = await supabaseClient.auth.getSession();

        // No session: redirectIfSignedOut is already sending the user to login
        if (!sessionData.session) return;

        // Row Level Security returns only this guide's own tours
        const { data, error } = await supabaseClient
            .from("tours")
            .select("id, title, client_name, start_date, end_date, status")
            .order("start_date", { ascending: false });

        if (error) throw error;

        toursLoading.hidden = true;

        if (data.length === 0) {
            toursEmpty.hidden = false;
            return;
        }

        data.forEach(function (tour) {
            toursList.appendChild(createTourCard(tour));
        });
    } catch (error) {
        toursLoading.hidden = true;
        toursError.hidden = false;
    }
}

loadTours();