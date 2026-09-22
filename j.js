

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

  
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
  
  const firebaseConfig = {
    apiKey: "AIzaSyB31XbqNeoQvpKthFXvHh2kN4WNaeihSlI",
    authDomain: "sagarhub-ffa62.firebaseapp.com",
    projectId: "sagarhub-ffa62",
    storageBucket: "sagarhub-ffa62.firebasestorage.app",
    messagingSenderId: "217343016577",
    appId: "1:217343016577:web:65974d97ebc202f8e91780",
    measurementId: "G-EX0E5LZZF6"
  };

  
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);



const auth = getAuth(app);

const db = getFirestore(app);


// ======================================================
// DOM ELEMENTS
// ======================================================

const authScreen = document.getElementById("authScreen");

const appScreen = document.getElementById("app");

const loginBox = document.getElementById("loginBox");

const signupBox = document.getElementById("signupBox");

const loginForm = document.getElementById("loginForm");

const signupForm = document.getElementById("signupForm");

const loginMessage = document.getElementById("loginMessage");

const signupMessage = document.getElementById("signupMessage");

const userEmail = document.getElementById("userEmail");

const userAvatar = document.getElementById("userAvatar");


// ======================================================
// SHOW LOGIN / SIGNUP
// ======================================================

document.getElementById("showSignup").addEventListener("click", () => {

    loginBox.classList.add("hidden");

    signupBox.classList.remove("hidden");

    loginMessage.textContent = "";

});


document.getElementById("showLogin").addEventListener("click", () => {

    signupBox.classList.add("hidden");

    loginBox.classList.remove("hidden");

    signupMessage.textContent = "";

});


// ======================================================
// SIGN UP
// ======================================================

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const name =
        document.getElementById("signupName").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value;


    signupMessage.textContent = "Creating account...";


    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );


        // User successfully created
        console.log("User created:", userCredential.user);

        signupMessage.textContent =
            "Account created successfully!";


        signupForm.reset();


    } catch (error) {

        console.error(error);

        signupMessage.textContent =
            getFirebaseError(error);

    }

});


// ======================================================
// LOGIN
// ======================================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const email =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value;


    loginMessage.textContent = "Logging in...";


    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        console.log(
            "Logged in:",
            userCredential.user.email
        );


        loginMessage.textContent = "";


    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            getFirebaseError(error);

    }

});


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        // USER LOGGED IN

        authScreen.classList.add("hidden");

        appScreen.classList.remove("hidden");


        userEmail.textContent =
            user.email;


        userAvatar.textContent =
            user.email
                ? user.email.charAt(0).toUpperCase()
                : "U";


        loadMeetings();

        loadEvents();

        loadPolicies();


    } else {

        // USER LOGGED OUT

        authScreen.classList.remove("hidden");

        appScreen.classList.add("hidden");

    }

});


// ======================================================
// LOGOUT
// ======================================================

document
    .getElementById("logoutBtn")
    .addEventListener("click", async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(error);

        }

    });


// ======================================================
// NAVIGATION
// ======================================================

const navButtons =
    document.querySelectorAll(".nav-btn");


navButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;


        showPage(page);


        navButtons.forEach((btn) => {

            btn.classList.remove("active");

        });


        button.classList.add("active");

    });

});


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach((section) => {

            section.classList.add("hidden");

        });


    const selectedPage =
        document.getElementById(page + "Page");


    if (selectedPage) {

        selectedPage.classList.remove("hidden");

    }


    const titles = {

        dashboard: "Dashboard",

        meetings: "Meetings",

        events: "Events",

        policies: "Policies & Rules"

    };


    document.getElementById("pageTitle").textContent =
        titles[page] || "Dashboard";

}


// ======================================================
// MODALS
// ======================================================

function openModal(id) {

    document
        .getElementById(id)
        .classList.remove("hidden");

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.add("hidden");

}


document
    .querySelectorAll("[data-close]")
    .forEach((button) => {

        button.addEventListener("click", () => {

            closeModal(
                button.dataset.close
            );

        });

    });


document
    .getElementById("addMeetingBtn")
    .addEventListener("click", () => {

        openModal("meetingModal");

    });


document
    .getElementById("dashboardMeetingBtn")
    .addEventListener("click", () => {

        openModal("meetingModal");

    });


document
    .getElementById("addEventBtn")
    .addEventListener("click", () => {

        openModal("eventModal");

    });


document
    .getElementById("addPolicyBtn")
    .addEventListener("click", () => {

        openModal("policyModal");

    });


// ======================================================
// MEETING
// ======================================================

document
    .getElementById("meetingForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();


        const user = auth.currentUser;

        if (!user) return;


        const title =
            document.getElementById("meetingTitle").value.trim();

        const date =
            document.getElementById("meetingDate").value;

        const venue =
            document.getElementById("meetingVenue").value.trim();

        const agenda =
            document.getElementById("meetingAgenda").value.trim();

        const minutes =
            document.getElementById("meetingMinutes").value.trim();


        try {

            await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "meetings"
                ),
                {

                    title,

                    date,

                    venue,

                    agenda,

                    minutes,

                    createdAt:
                        serverTimestamp()

                }
            );


            document
                .getElementById("meetingForm")
                .reset();


            closeModal("meetingModal");

            showToast("Meeting saved successfully");


        } catch (error) {

            console.error(error);

            alert(
                "Could not save meeting: " +
                error.message
            );

        }

    });


// ======================================================
// LOAD MEETINGS
// ======================================================

function loadMeetings() {

    const user = auth.currentUser;

    if (!user) return;


    const meetingList =
        document.getElementById("meetingList");

    const recentMeetings =
        document.getElementById("recentMeetings");


    const meetingsRef =
        collection(
            db,
            "users",
            user.uid,
            "meetings"
        );


    const q =
        query(
            meetingsRef,
            orderBy("createdAt", "desc")
        );


    onSnapshot(q, (snapshot) => {

        meetingList.innerHTML = "";

        recentMeetings.innerHTML = "";


        document.getElementById("meetingCount")
            .textContent =
            snapshot.size;


        if (snapshot.empty) {

            meetingList.innerHTML =
                `<p class="empty">No meetings found.</p>`;

            recentMeetings.innerHTML =
                `<p class="empty">No meetings yet.</p>`;

            return;

        }


        snapshot.forEach((docSnapshot) => {

            const meeting =
                docSnapshot.data();


            const id =
                docSnapshot.id;


            const card = document.createElement("div");

            card.className = "record-card";


            card.innerHTML = `

                <h3>${escapeHTML(meeting.title)}</h3>

                <p class="date">
                    📅 ${escapeHTML(meeting.date)}
                </p>

                <p>
                    📍 ${escapeHTML(meeting.venue)}
                </p>

                <p>
                    <strong>Agenda:</strong><br>
                    ${escapeHTML(meeting.agenda)}
                </p>

                <p>
                    <strong>Minutes:</strong><br>
                    ${escapeHTML(meeting.minutes || "Not added")}
                </p>

                <button class="delete-btn"
                    data-id="${id}">
                    Delete
                </button>

            `;


            meetingList.appendChild(card);


            const recent =
                document.createElement("div");

            recent.className = "record-card";


            recent.innerHTML = `

                <h3>${escapeHTML(meeting.title)}</h3>

                <p class="date">
                    ${escapeHTML(meeting.date)}
                </p>

                <p>
                    ${escapeHTML(meeting.venue)}
                </p>

            `;


            recentMeetings.appendChild(recent);

        });


        document
            .querySelectorAll("#meetingList .delete-btn")
            .forEach((button) => {

                button.addEventListener("click", () => {

                    deleteMeeting(button.dataset.id);

                });

            });

    });

}


// ======================================================
// DELETE MEETING
// ======================================================

async function deleteMeeting(id) {

    const user = auth.currentUser;

    if (!user) return;


    const confirmDelete =
        confirm("Delete this meeting?");


    if (!confirmDelete) return;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "meetings",
                id
            )
        );


        showToast("Meeting deleted");

    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// EVENT
// ======================================================

document
    .getElementById("eventForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();


        const user = auth.currentUser;

        if (!user) return;


        const title =
            document.getElementById("eventTitle").value.trim();

        const date =
            document.getElementById("eventDate").value;

        const location =
            document.getElementById("eventLocation").value.trim();

        const description =
            document.getElementById("eventDescription").value.trim();


        try {

            await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "events"
                ),
                {

                    title,

                    date,

                    location,

                    description,

                    createdAt:
                        serverTimestamp()

                }
            );


            document
                .getElementById("eventForm")
                .reset();


            closeModal("eventModal");

            showToast("Event saved successfully");


        } catch (error) {

            console.error(error);

            alert(
                "Could not save event: " +
                error.message
            );

        }

    });


// ======================================================
// LOAD EVENTS
// ======================================================

function loadEvents() {

    const user = auth.currentUser;

    if (!user) return;


    const list =
        document.getElementById("eventList");


    const ref =
        collection(
            db,
            "users",
            user.uid,
            "events"
        );


    const q =
        query(
            ref,
            orderBy("createdAt", "desc")
        );


    onSnapshot(q, (snapshot) => {

        list.innerHTML = "";


        document.getElementById("eventCount")
            .textContent =
            snapshot.size;


        if (snapshot.empty) {

            list.innerHTML =
                `<p class="empty">No events found.</p>`;

            return;

        }


        snapshot.forEach((docSnapshot) => {

            const event =
                docSnapshot.data();


            const card =
                document.createElement("div");


            card.className =
                "record-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(event.title)}
                </h3>

                <p class="date">
                    📅 ${escapeHTML(event.date)}
                </p>

                <p>
                    📍 ${escapeHTML(event.location)}
                </p>

                <p>
                    ${escapeHTML(event.description || "")}
                </p>

                <button
                    class="delete-btn"
                    data-id="${docSnapshot.id}">
                    Delete
                </button>

            `;


            list.appendChild(card);

        });


        list
            .querySelectorAll(".delete-btn")
            .forEach((button) => {

                button.addEventListener("click", () => {

                    deleteEvent(button.dataset.id);

                });

            });

    });

}


// ======================================================
// DELETE EVENT
// ======================================================

async function deleteEvent(id) {

    const user = auth.currentUser;

    if (!user) return;


    if (!confirm("Delete this event?")) return;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "events",
                id
            )
        );


        showToast("Event deleted");

    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// POLICY
// ======================================================

document
    .getElementById("policyForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();


        const user = auth.currentUser;

        if (!user) return;


        const title =
            document.getElementById("policyTitle").value.trim();

        const version =
            document.getElementById("policyVersion").value.trim();

        const date =
            document.getElementById("policyDate").value;

        const description =
            document.getElementById("policyDescription").value.trim();


        try {

            await addDoc(
                collection(
                    db,
                    "users",
                    user.uid,
                    "policies"
                ),
                {

                    title,

                    version,

                    date,

                    description,

                    createdAt:
                        serverTimestamp()

                }
            );


            document
                .getElementById("policyForm")
                .reset();


            closeModal("policyModal");

            showToast("Policy saved successfully");


        } catch (error) {

            console.error(error);

            alert(
                "Could not save policy: " +
                error.message
            );

        }

    });


// ======================================================
// LOAD POLICIES
// ======================================================

function loadPolicies() {

    const user = auth.currentUser;

    if (!user) return;


    const list =
        document.getElementById("policyList");


    const ref =
        collection(
            db,
            "users",
            user.uid,
            "policies"
        );


    const q =
        query(
            ref,
            orderBy("createdAt", "desc")
        );


    onSnapshot(q, (snapshot) => {

        list.innerHTML = "";


        document.getElementById("policyCount")
            .textContent =
            snapshot.size;


        if (snapshot.empty) {

            list.innerHTML =
                `<p class="empty">No policies found.</p>`;

            return;

        }


        snapshot.forEach((docSnapshot) => {

            const policy =
                docSnapshot.data();


            const card =
                document.createElement("div");


            card.className =
                "record-card";


            card.innerHTML = `

                <h3>
                    ${escapeHTML(policy.title)}
                </h3>

                <p>
                    <strong>Version:</strong>
                    ${escapeHTML(policy.version)}
                </p>

                <p class="date">
                    Effective:
                    ${escapeHTML(policy.date)}
                </p>

                <p>
                    ${escapeHTML(policy.description)}
                </p>

                <button
                    class="delete-btn"
                    data-id="${docSnapshot.id}">
                    Delete
                </button>

            `;


            list.appendChild(card);

        });


        list
            .querySelectorAll(".delete-btn")
            .forEach((button) => {

                button.addEventListener("click", () => {

                    deletePolicy(button.dataset.id);

                });

            });

    });

}


// ======================================================
// DELETE POLICY
// ======================================================

async function deletePolicy(id) {

    const user = auth.currentUser;

    if (!user) return;


    if (!confirm("Delete this policy?")) return;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                user.uid,
                "policies",
                id
            )
        );


        showToast("Policy deleted");

    } catch (error) {

        console.error(error);

    }

}


// ======================================================
// TOAST
// ======================================================

function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent =
        message;


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


// ======================================================
// FIREBASE ERROR MESSAGES
// ======================================================

function getFirebaseError(error) {

    switch (error.code) {

        case "auth/email-already-in-use":
            return "This email is already registered.";

        case "auth/invalid-email":
            return "Invalid email address.";

        case "auth/weak-password":
            return "Password is too weak.";

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/operation-not-allowed":
            return "Email/Password login is not enabled in Firebase.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        default:
            return error.message;

    }

}


// ======================================================
// SECURITY: HTML ESCAPE
// ======================================================

function escapeHTML(value) {

    if (!value) return "";

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}