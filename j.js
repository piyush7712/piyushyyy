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


/* ================= FIREBASE ================= */

const firebaseConfig = {

    apiKey: "AIzaSyB31XbqNeoQvpKthFXvHh2kN4WNaeihSlI",

    authDomain:
        "sagarhub-ffa62.firebaseapp.com",

    projectId:
        "sagarhub-ffa62",

    storageBucket:
        "sagarhub-ffa62.firebasestorage.app",

    messagingSenderId:
        "217343016577",

    appId:
        "1:217343016577:web:65974d97ebc202f8e91780",

    measurementId:
        "G-EX0E5LZZF6"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* =================================================
   IMPORTANT
   
   PUT YOUR ADMIN FIREBASE UID HERE
   ================================================= */

const ADMIN_UID =
    "PASTE_YOUR_ADMIN_UID_HERE";


let isAdmin = false;


/* ================= DOM ================= */

const authScreen =
    document.getElementById("authScreen");

const appScreen =
    document.getElementById("app");

const loginBox =
    document.getElementById("loginBox");

const signupBox =
    document.getElementById("signupBox");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const loginMessage =
    document.getElementById("loginMessage");

const signupMessage =
    document.getElementById("signupMessage");

const userEmail =
    document.getElementById("userEmail");

const userAvatar =
    document.getElementById("userAvatar");

const userRole =
    document.getElementById("userRole");


/* ================= LOGIN / SIGNUP SWITCH ================= */

document
    .getElementById("showSignup")
    .onclick = () => {

        loginBox.classList.add("hidden");

        signupBox.classList.remove("hidden");

        loginMessage.textContent = "";
    };


document
    .getElementById("showLogin")
    .onclick = () => {

        signupBox.classList.add("hidden");

        loginBox.classList.remove("hidden");

        signupMessage.textContent = "";
    };


/* ================= SIGNUP ================= */

signupForm.addEventListener(
    "submit",
    async e => {

        e.preventDefault();

        const email =
            document.getElementById(
                "signupEmail"
            ).value;

        const password =
            document.getElementById(
                "signupPassword"
            ).value;

        try {

            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            signupMessage.textContent =
                "Account created successfully.";

            signupForm.reset();

        } catch (error) {

            signupMessage.textContent =
                getError(error);

        }
    }
);


/* ================= LOGIN ================= */

loginForm.addEventListener(
    "submit",
    async e => {

        e.preventDefault();

        const email =
            document.getElementById(
                "loginEmail"
            ).value;

        const password =
            document.getElementById(
                "loginPassword"
            ).value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            loginMessage.textContent = "";

        } catch (error) {

            loginMessage.textContent =
                getError(error);

        }
    }
);


/* ================= AUTH STATE ================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            authScreen.classList.remove(
                "hidden"
            );

            appScreen.classList.add(
                "hidden"
            );

            return;
        }


        authScreen.classList.add(
            "hidden"
        );

        appScreen.classList.remove(
            "hidden"
        );


        userEmail.textContent =
            user.email;


        userAvatar.textContent =
            user.email
                .charAt(0)
                .toUpperCase();


        /* CHECK ADMIN */

        isAdmin =
            user.uid === ADMIN_UID;


        userRole.textContent =
            isAdmin
                ? "ADMIN"
                : "USER";


        updateAdminUI();


        loadMeetings();

        loadEvents();

        loadPolicies();

    }
);


/* ================= LOGOUT ================= */

document
    .getElementById("logoutBtn")
    .onclick = () => {

        signOut(auth);

    };


/* ================= ADMIN UI ================= */

function updateAdminUI() {

    const buttons = [

        "addMeetingBtn",

        "dashboardMeetingBtn",

        "addEventBtn",

        "addPolicyBtn"

    ];


    buttons.forEach(id => {

        const button =
            document.getElementById(id);

        if (!button) return;


        button.style.display =
            isAdmin
                ? ""
                : "none";

    });

}


/* =================================================
   SHARED INSTITUTIONAL DATA

   All users read ADMIN records.
   Only ADMIN can create/delete.
   ================================================= */

function dataPath(type) {

    return collection(
        db,
        "users",
        ADMIN_UID,
        type
    );

}


/* ================= NAVIGATION ================= */

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.onclick = () => {

            const page =
                button.dataset.page;


            document
                .querySelectorAll(".page")
                .forEach(p => {

                    p.classList.add(
                        "hidden"
                    );

                });


            document
                .getElementById(
                    page + "Page"
                )
                .classList.remove(
                    "hidden"
                );


            document
                .querySelectorAll(".nav-btn")
                .forEach(b => {

                    b.classList.remove(
                        "active"
                    );

                });


            button.classList.add(
                "active"
            );


            const titles = {

                dashboard:
                    "Dashboard",

                meetings:
                    "Meetings",

                events:
                    "Events",

                policies:
                    "Policies & Rules"

            };


            document
                .getElementById(
                    "pageTitle"
                )
                .textContent =
                    titles[page];

        };

    });


/* ================= MODALS ================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.remove(
            "hidden"
        );

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.add(
            "hidden"
        );

}


document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.onclick = () => {

            closeModal(
                button.dataset.close
            );

        };

    });


/* OPEN BUTTONS */

document
    .getElementById("addMeetingBtn")
    .onclick = () => {

        openModal("meetingModal");

    };


document
    .getElementById(
        "dashboardMeetingBtn"
    )
    .onclick = () => {

        openModal("meetingModal");

    };


document
    .getElementById("addEventBtn")
    .onclick = () => {

        openModal("eventModal");

    };


document
    .getElementById("addPolicyBtn")
    .onclick = () => {

        openModal("policyModal");

    };


/* =================================================
   ADD MEETING
   ================================================= */

document
    .getElementById("meetingForm")
    .addEventListener(
        "submit",
        async e => {

            e.preventDefault();


            if (!isAdmin) {

                showToast(
                    "Only admin can add meetings."
                );

                return;
            }


            try {

                await addDoc(
                    dataPath("meetings"),
                    {

                        title:
                            document
                                .getElementById(
                                    "meetingTitle"
                                )
                                .value,

                        date:
                            document
                                .getElementById(
                                    "meetingDate"
                                )
                                .value,

                        venue:
                            document
                                .getElementById(
                                    "meetingVenue"
                                )
                                .value,

                        agenda:
                            document
                                .getElementById(
                                    "meetingAgenda"
                                )
                                .value,

                        minutes:
                            document
                                .getElementById(
                                    "meetingMinutes"
                                )
                                .value,

                        action:
                            document
                                .getElementById(
                                    "meetingAction"
                                )
                                .value,

                        actionOwner:
                            document
                                .getElementById(
                                    "actionOwner"
                                )
                                .value,

                        actionDue:
                            document
                                .getElementById(
                                    "actionDue"
                                )
                                .value,

                        status:
                            document
                                .getElementById(
                                    "meetingStatus"
                                )
                                .value,

                        createdAt:
                            serverTimestamp()

                    }
                );


                e.target.reset();

                closeModal(
                    "meetingModal"
                );

                showToast(
                    "Meeting added successfully."
                );

            } catch (error) {

                alert(error.message);

            }

        }
    );


/* =================================================
   LOAD MEETINGS
   ================================================= */

function loadMeetings() {

    const q = query(
        dataPath("meetings"),
        orderBy(
            "createdAt",
            "desc"
        )
    );


    onSnapshot(
        q,
        snapshot => {

            const list =
                document.getElementById(
                    "meetingList"
                );

            const recent =
                document.getElementById(
                    "recentMeetings"
                );


            list.innerHTML = "";

            recent.innerHTML = "";


            document
                .getElementById(
                    "meetingCount"
                )
                .textContent =
                    snapshot.size;


            let pendingActions = 0;


            if (snapshot.empty) {

                list.innerHTML =
                    `<p class="empty">
                        No meetings found.
                    </p>`;

                recent.innerHTML =
                    `<p class="empty">
                        No meetings yet.
                    </p>`;

                document
                    .getElementById(
                        "actionCount"
                    )
                    .textContent = 0;

                return;
            }


            snapshot.forEach(item => {

                const meeting =
                    item.data();


                if (
                    meeting.action &&
                    meeting.actionStatus !==
                    "Completed"
                ) {

                    pendingActions++;

                }


                list.innerHTML += `

                    <div class="record-card">

                        <h3>
                            ${safe(meeting.title)}
                        </h3>

                        <p>
                            📅 ${safe(meeting.date)}
                        </p>

                        <p>
                            📍 ${safe(meeting.venue)}
                        </p>

                        <p>
                            <strong>
                                Status:
                            </strong>

                            ${safe(
                                meeting.status
                            )}
                        </p>

                        <p>
                            <strong>
                                Agenda:
                            </strong><br>

                            ${safe(
                                meeting.agenda
                            )}
                        </p>

                        <p>
                            <strong>
                                Minutes / Decision:
                            </strong><br>

                            ${safe(
                                meeting.minutes ||
                                "Not added"
                            )}
                        </p>

                        ${
                            meeting.action
                            ? `

                            <p>
                                <strong>
                                    Action:
                                </strong>

                                ${safe(
                                    meeting.action
                                )}
                            </p>

                            <p>
                                👤 ${safe(
                                    meeting.actionOwner ||
                                    "Not assigned"
                                )}
                            </p>

                            <p>
                                📅 Due:
                                ${safe(
                                    meeting.actionDue ||
                                    "Not set"
                                )}
                            </p>

                            `
                            : ""
                        }


                        ${
                            isAdmin
                            ? `

                            <button
                                class="delete-btn"
                                data-id="${item.id}"
                            >
                                Delete
                            </button>

                            `
                            : ""
                        }

                    </div>

                `;


                recent.innerHTML += `

                    <div class="record-card">

                        <h3>
                            ${safe(
                                meeting.title
                            )}
                        </h3>

                        <p>
                            📅 ${safe(
                                meeting.date
                            )}
                        </p>

                        <p>
                            📍 ${safe(
                                meeting.venue
                            )}
                        </p>

                        <p>
                            ${safe(
                                meeting.status
                            )}
                        </p>

                    </div>

                `;

            });


            document
                .getElementById(
                    "actionCount"
                )
                .textContent =
                    pendingActions;


            list
                .querySelectorAll(
                    ".delete-btn"
                )
                .forEach(button => {

                    button.onclick = () => {

                        deleteRecord(
                            "meetings",
                            button.dataset.id
                        );

                    };

                });

        }
    );

}


/* =================================================
   ADD EVENT
   ================================================= */

document
    .getElementById("eventForm")
    .addEventListener(
        "submit",
        async e => {

            e.preventDefault();


            if (!isAdmin) {

                showToast(
                    "Only admin can add events."
                );

                return;
            }


            try {

                await addDoc(
                    dataPath("events"),
                    {

                        title:
                            document
                                .getElementById(
                                    "eventTitle"
                                )
                                .value,

                        date:
                            document
                                .getElementById(
                                    "eventDate"
                                )
                                .value,

                        location:
                            document
                                .getElementById(
                                    "eventLocation"
                                )
                                .value,

                        description:
                            document
                                .getElementById(
                                    "eventDescription"
                                )
                                .value,

                        speaker:
                            document
                                .getElementById(
                                    "eventSpeaker"
                                )
                                .value,

                        archiveLink:
                            document
                                .getElementById(
                                    "eventLink"
                                )
                                .value,

                        createdAt:
                            serverTimestamp()

                    }
                );


                e.target.reset();

                closeModal(
                    "eventModal"
                );

                showToast(
                    "Event added successfully."
                );

            } catch (error) {

                alert(error.message);

            }

        }
    );


/* =================================================
   LOAD EVENTS
   ================================================= */

function loadEvents() {

    const q = query(
        dataPath("events"),
        orderBy(
            "createdAt",
            "desc"
        )
    );


    onSnapshot(
        q,
        snapshot => {

            const list =
                document.getElementById(
                    "eventList"
                );


            list.innerHTML = "";


            document
                .getElementById(
                    "eventCount"
                )
                .textContent =
                    snapshot.size;


            if (snapshot.empty) {

                list.innerHTML =
                    `<p class="empty">
                        No events found.
                    </p>`;

                return;
            }


            snapshot.forEach(item => {

                const event =
                    item.data();


                list.innerHTML += `

                    <div class="record-card">

                        <h3>
                            ${safe(event.title)}
                        </h3>

                        <p>
                            📅 ${safe(event.date)}
                        </p>

                        <p>
                            📍 ${safe(event.location)}
                        </p>

                        <p>
                            ${safe(
                                event.description
                            )}
                        </p>

                        ${
                            event.speaker
                            ? `
                            <p>
                                🎤
                                <strong>
                                    Speaker:
                                </strong>
                                ${safe(
                                    event.speaker
                                )}
                            </p>
                            `
                            : ""
                        }

                        ${
                            event.archiveLink
                            ? `
                            <p>
                                🔗
                                <a
                                    href="${safe(
                                        event.archiveLink
                                    )}"
                                    target="_blank"
                                >
                                    Event Archive
                                </a>
                            </p>
                            `
                            : ""
                        }

                        ${
                            isAdmin
                            ? `

                            <button
                                class="delete-btn"
                                data-id="${item.id}"
                            >
                                Delete
                            </button>

                            `
                            : ""
                        }

                    </div>

                `;

            });


            list
                .querySelectorAll(
                    ".delete-btn"
                )
                .forEach(button => {

                    button.onclick = () => {

                        deleteRecord(
                            "events",
                            button.dataset.id
                        );

                    };

                });

        }
    );

}


/* =================================================
   ADD POLICY
   ================================================= */

document
    .getElementById("policyForm")
    .addEventListener(
        "submit",
        async e => {

            e.preventDefault();


            if (!isAdmin) {

                showToast(
                    "Only admin can add policies."
                );

                return;
            }


            try {

                await addDoc(
                    dataPath("policies"),
                    {

                        title:
                            document
                                .getElementById(
                                    "policyTitle"
                                )
                                .value,

                        version:
                            document
                                .getElementById(
                                    "policyVersion"
                                )
                                .value,

                        date:
                            document
                                .getElementById(
                                    "policyDate"
                                )
                                .value,

                        description:
                            document
                                .getElementById(
                                    "policyDescription"
                                )
                                .value,

                        createdAt:
                            serverTimestamp()

                    }
                );


                e.target.reset();

                closeModal(
                    "policyModal"
                );

                showToast(
                    "Policy added successfully."
                );

            } catch (error) {

                alert(error.message);

            }

        }
    );


/* =================================================
   LOAD POLICIES
   ================================================= */

function loadPolicies() {

    const q = query(
        dataPath("policies"),
        orderBy(
            "createdAt",
            "desc"
        )
    );


    onSnapshot(
        q,
        snapshot => {

            const list =
                document.getElementById(
                    "policyList"
                );


            list.innerHTML = "";


            document
                .getElementById(
                    "policyCount"
                )
                .textContent =
                    snapshot.size;


            if (snapshot.empty) {

                list.innerHTML =
                    `<p class="empty">
                        No policies found.
                    </p>`;

                return;
            }


            snapshot.forEach(item => {

                const policy =
                    item.data();


                list.innerHTML += `

                    <div class="record-card">

                        <h3>
                            ${safe(
                                policy.title
                            )}
                        </h3>

                        <p>
                            📚
                            <strong>
                                Version:
                            </strong>

                            ${safe(
                                policy.version
                            )}
                        </p>

                        <p>
                            📅
                            Effective:
                            ${safe(
                                policy.date
                            )}
                        </p>

                        <p>
                            ${safe(
                                policy.description
                            )}
                        </p>


                        ${
                            isAdmin
                            ? `

                            <button
                                class="delete-btn"
                                data-id="${item.id}"
                            >
                                Delete
                            </button>

                            `
                            : ""
                        }

                    </div>

                `;

            });


            list
                .querySelectorAll(
                    ".delete-btn"
                )
                .forEach(button => {

                    button.onclick = () => {

                        deleteRecord(
                            "policies",
                            button.dataset.id
                        );

                    };

                });

        }
    );

}


/* =================================================
   DELETE
   ================================================= */

async function deleteRecord(
    type,
    id
) {

    if (!isAdmin) {

        showToast(
            "Only admin can delete."
        );

        return;
    }


    const confirmDelete =
        confirm(
            "Delete this record?"
        );


    if (!confirmDelete)
        return;


    try {

        await deleteDoc(

            doc(
                db,
                "users",
                ADMIN_UID,
                type,
                id
            )

        );


        showToast(
            "Deleted successfully."
        );

    } catch (error) {

        alert(
            error.message
        );

    }

}


/* =================================================
   SEARCH
   ================================================= */

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        e => {

            const text =
                e.target.value
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".record-card"
                )
                .forEach(card => {

                    const content =
                        card.textContent
                            .toLowerCase();


                    card.style.display =
                        content.includes(text)
                            ? ""
                            : "none";

                });

        }
    );


/* =================================================
   TOAST
   ================================================= */

function showToast(text) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        text;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


/* =================================================
   SECURITY: ESCAPE HTML
   ================================================= */

function safe(value) {

    return String(
        value || ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =================================================
   FIREBASE ERROR MESSAGES
   ================================================= */

function getError(error) {

    const errors = {

        "auth/email-already-in-use":
            "This email is already registered.",

        "auth/invalid-email":
            "Invalid email address.",

        "auth/weak-password":
            "Password must be at least 6 characters.",

        "auth/invalid-credential":
            "Incorrect email or password."

    };


    return (
        errors[error.code] ||
        error.message
    );

}