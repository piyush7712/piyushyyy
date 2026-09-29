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
    authDomain: "sagarhub-ffa62.firebaseapp.com",
    projectId: "sagarhub-ffa62",
    storageBucket: "sagarhub-ffa62.firebasestorage.app",
    messagingSenderId: "217343016577",
    appId: "1:217343016577:web:65974d97ebc202f8e91780",
    measurementId: "G-EX0E5LZZF6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= ADMIN DATA ================= */

const ADMIN_UIDS = [
    "aQ3rE6XskFWueVUFNiR2Oj4GxAZ2",
    "dru1GGXszkVkdAeYAqpoCsDoehF2",
    "N6lVEy0lLbQua6my0Ktokym3AD22"
];

const DATA_OWNER_UID =
    "aQ3rE6XskFWueVUFNiR2Oj4GxAZ2";

let isAdmin = false;

let meetingUnsubscribe = null;
let eventUnsubscribe = null;
let policyUnsubscribe = null;

let toastTimer = null;


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

const pageTitle =
    document.getElementById("pageTitle");


/* ================= LOGIN / SIGNUP SWITCH ================= */

const showSignupButton =
    document.getElementById("showSignup");

const showLoginButton =
    document.getElementById("showLogin");

if (showSignupButton) {
    showSignupButton.onclick = () => {

        loginBox.classList.add("hidden");
        signupBox.classList.remove("hidden");

        loginMessage.textContent = "";
    };
}

if (showLoginButton) {
    showLoginButton.onclick = () => {

        signupBox.classList.add("hidden");
        loginBox.classList.remove("hidden");

        signupMessage.textContent = "";
    };
}


/* ================= SIGNUP ================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async e => {

            e.preventDefault();

            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();

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

}


/* ================= LOGIN ================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async e => {

            e.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

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

}


/* ================= AUTH STATE ================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            isAdmin = false;

            authScreen.classList.remove(
                "hidden"
            );

            appScreen.classList.add(
                "hidden"
            );

            updateAdminUI();

            stopListeners();

            return;
        }


        authScreen.classList.add(
            "hidden"
        );

        appScreen.classList.remove(
            "hidden"
        );


        userEmail.textContent =
            user.email || "User";


        userAvatar.textContent =
            (user.email || "U")
                .charAt(0)
                .toUpperCase();


        isAdmin =
            ADMIN_UIDS.includes(user.uid);


        userRole.textContent =
            isAdmin
                ? "ADMIN"
                : "USER";


        updateAdminUI();

        showPage("dashboard");

        loadMeetings();
        loadEvents();
        loadPolicies();

    }
);


/* ================= LOGOUT ================= */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.onclick = async () => {

        try {

            await signOut(auth);

        } catch (error) {

            showToast(error.message);

        }

    };

}


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


/* ================= DATA PATH ================= */

function dataPath(type) {

    return collection(
        db,
        "users",
        DATA_OWNER_UID,
        type
    );

}


/* ================= NAVIGATION ================= */

const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );

navButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            showPage(page);

        }
    );

});


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.add(
                "hidden"
            );

            section.classList.remove(
                "active-page"
            );

        });


    const selectedPage =
        document.getElementById(
            page + "Page"
        );

    if (selectedPage) {

        selectedPage.classList.remove(
            "hidden"
        );

        selectedPage.classList.add(
            "active-page"
        );

    }


    navButtons.forEach(button => {

        button.classList.remove(
            "active"
        );

        if (
            button.dataset.page === page
        ) {

            button.classList.add(
                "active"
            );

        }

    });


    const titles = {

        dashboard:
            "Dashboard",

        meetings:
            "Meetings",

        events:
            "Events & Archive",

        policies:
            "Policies & Rules"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[page] ||
            "Dashboard";

    }

}


/* ================= MODALS ================= */

function openModal(id) {

    if (!isAdmin) {

        showToast(
            "Only admin can perform this action."
        );

        return;

    }

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.remove(
        "hidden"
    );

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) return;

    modal.classList.add(
        "hidden"
    );

}


document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                closeModal(
                    button.dataset.close
                );

            }
        );

    });


/* ================= OPEN BUTTONS ================= */

const addMeetingBtn =
    document.getElementById(
        "addMeetingBtn"
    );

if (addMeetingBtn) {

    addMeetingBtn.onclick = () => {

        openModal(
            "meetingModal"
        );

    };

}


const dashboardMeetingBtn =
    document.getElementById(
        "dashboardMeetingBtn"
    );

if (dashboardMeetingBtn) {

    dashboardMeetingBtn.onclick = () => {

        openModal(
            "meetingModal"
        );

    };

}


const addEventBtn =
    document.getElementById(
        "addEventBtn"
    );

if (addEventBtn) {

    addEventBtn.onclick = () => {

        openModal(
            "eventModal"
        );

    };

}


const addPolicyBtn =
    document.getElementById(
        "addPolicyBtn"
    );

if (addPolicyBtn) {

    addPolicyBtn.onclick = () => {

        openModal(
            "policyModal"
        );

    };

}


/* ================= EMPTY STATE BUTTONS ================= */

function attachEmptyStateButtons() {

    const emptyMeetingBtn =
        document.getElementById(
            "emptyMeetingBtn"
        );

    if (emptyMeetingBtn) {

        emptyMeetingBtn.onclick = () => {

            openModal(
                "meetingModal"
            );

        };

    }


    const emptyEventBtn =
        document.getElementById(
            "emptyEventBtn"
        );

    if (emptyEventBtn) {

        emptyEventBtn.onclick = () => {

            openModal(
                "eventModal"
            );

        };

    }


    const emptyPolicyBtn =
        document.getElementById(
            "emptyPolicyBtn"
        );

    if (emptyPolicyBtn) {

        emptyPolicyBtn.onclick = () => {

            openModal(
                "policyModal"
            );

        };

    }

}

attachEmptyStateButtons();


/* =================================================
   ADD MEETING
   ================================================= */

const meetingForm =
    document.getElementById(
        "meetingForm"
    );

if (meetingForm) {

    meetingForm.addEventListener(
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
                                .value
                                .trim(),

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
                                .value
                                .trim(),

                        agenda:
                            document
                                .getElementById(
                                    "meetingAgenda"
                                )
                                .value
                                .trim(),

                        minutes:
                            document
                                .getElementById(
                                    "meetingMinutes"
                                )
                                .value
                                .trim(),

                        action:
                            document
                                .getElementById(
                                    "meetingAction"
                                )
                                .value
                                .trim(),

                        actionOwner:
                            document
                                .getElementById(
                                    "actionOwner"
                                )
                                .value
                                .trim(),

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

                        createdBy:
                            auth.currentUser.uid,

                        createdAt:
                            serverTimestamp()

                    }
                );


                meetingForm.reset();

                closeModal(
                    "meetingModal"
                );

                showToast(
                    "Meeting added successfully."
                );

            } catch (error) {

                showToast(
                    error.message
                );

            }

        }
    );

}


/* =================================================
   LOAD MEETINGS
   ================================================= */

function loadMeetings() {

    if (meetingUnsubscribe) {

        meetingUnsubscribe();

    }


    const q = query(
        dataPath("meetings"),
        orderBy(
            "createdAt",
            "desc"
        )
    );


    meetingUnsubscribe =
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


                if (!list || !recent)
                    return;


                list.innerHTML = "";

                recent.innerHTML = "";


                const meetingCount =
                    document.getElementById(
                        "meetingCount"
                    );

                const actionCount =
                    document.getElementById(
                        "actionCount"
                    );


                if (meetingCount) {

                    meetingCount.textContent =
                        snapshot.size;

                }


                let pendingActions = 0;

                let recentIndex = 0;


                if (snapshot.empty) {

                    list.innerHTML = `
                        <div class="empty-state large-empty">
                            <div class="empty-icon">▣</div>
                            <strong>No meeting records</strong>
                            <span>
                                Add a meeting to start building
                                a searchable history of institutional decisions.
                            </span>
                            <button
                                id="emptyMeetingBtn"
                                class="secondary-btn empty-action"
                                type="button"
                            >
                                Create meeting
                            </button>
                        </div>
                    `;


                    recent.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">▣</div>
                            <strong>No meetings yet</strong>
                            <span>
                                Create the first meeting record
                                to build your institutional memory.
                            </span>
                        </div>
                    `;


                    if (actionCount) {

                        actionCount.textContent =
                            "0";

                    }


                    attachEmptyStateButtons();

                    return;

                }


                snapshot.forEach(item => {

                    const meeting =
                        item.data();


                    if (
                        meeting.action &&
                        meeting.status !==
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
                                        👤
                                        ${safe(
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
                                        data-id="${safeAttribute(item.id)}"
                                        type="button"
                                    >
                                        Delete
                                    </button>

                                `
                                : ""
                            }

                        </div>

                    `;


                    if (recentIndex < 5) {

                        recent.innerHTML += `

                            <div class="record-card">

                                <h3>
                                    ${safe(
                                        meeting.title
                                    )}
                                </h3>

                                <p>
                                    📅
                                    ${safe(
                                        meeting.date
                                    )}
                                </p>

                                <p>
                                    📍
                                    ${safe(
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

                        recentIndex++;

                    }

                });


                if (actionCount) {

                    actionCount.textContent =
                        pendingActions;

                }


                attachDeleteButtons(
                    list,
                    "meetings"
                );

            },
            error => {

                showToast(
                    error.message
                );

            }
        );

}


/* =================================================
   ADD EVENT
   ================================================= */

const eventForm =
    document.getElementById(
        "eventForm"
    );

if (eventForm) {

    eventForm.addEventListener(
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
                                .value
                                .trim(),

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
                                .value
                                .trim(),

                        description:
                            document
                                .getElementById(
                                    "eventDescription"
                                )
                                .value
                                .trim(),

                        speaker:
                            document
                                .getElementById(
                                    "eventSpeaker"
                                )
                                .value
                                .trim(),

                        archiveLink:
                            document
                                .getElementById(
                                    "eventLink"
                                )
                                .value
                                .trim(),

                        createdBy:
                            auth.currentUser.uid,

                        createdAt:
                            serverTimestamp()

                    }
                );


                eventForm.reset();

                closeModal(
                    "eventModal"
                );

                showToast(
                    "Event added successfully."
                );

            } catch (error) {

                showToast(
                    error.message
                );

            }

        }
    );

}


/* =================================================
   LOAD EVENTS
   ================================================= */

function loadEvents() {

    if (eventUnsubscribe) {

        eventUnsubscribe();

    }


    const q = query(
        dataPath("events"),
        orderBy(
            "createdAt",
            "desc"
        )
    );


    eventUnsubscribe =
        onSnapshot(
            q,
            snapshot => {

                const list =
                    document.getElementById(
                        "eventList"
                    );

                if (!list) return;


                list.innerHTML = "";


                const eventCount =
                    document.getElementById(
                        "eventCount"
                    );

                if (eventCount) {

                    eventCount.textContent =
                        snapshot.size;

                }


                if (snapshot.empty) {

                    list.innerHTML = `
                        <div class="empty-state large-empty">
                            <div class="empty-icon">◇</div>
                            <strong>No archived events</strong>
                            <span>
                                Add events, conferences or institutional
                                activities to preserve their history.
                            </span>
                            <button
                                id="emptyEventBtn"
                                class="secondary-btn empty-action"
                                type="button"
                            >
                                Create event
                            </button>
                        </div>
                    `;

                    attachEmptyStateButtons();

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
                                📅
                                ${safe(event.date)}
                            </p>

                            <p>
                                📍
                                ${safe(event.location)}
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
                                event.archiveLink &&
                                isSafeUrl(
                                    event.archiveLink
                                )
                                ? `

                                    <p>
                                        🔗
                                        <a
                                            href="${safeAttribute(
                                                event.archiveLink
                                            )}"
                                            target="_blank"
                                            rel="noopener noreferrer"
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
                                        data-id="${safeAttribute(item.id)}"
                                        type="button"
                                    >
                                        Delete
                                    </button>

                                `
                                : ""
                            }

                        </div>

                    `;

                });


                attachDeleteButtons(
                    list,
                    "events"
                );

            },
            error => {

                showToast(
                    error.message
                );

            }
        );

}


/* =================================================
   ADD POLICY
   ================================================= */

const policyForm =
    document.getElementById(
        "policyForm"
    );

if (policyForm) {

    policyForm.addEventListener(
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
                                .value
                                .trim(),

                        version:
                            document
                                .getElementById(
                                    "policyVersion"
                                )
                                .value
                                .trim(),

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
                                .value
                                .trim(),

                        createdBy:
                            auth.currentUser.uid,

                        createdAt:
                            serverTimestamp()

                    }
                );


                policyForm.reset();

                closeModal(
                    "policyModal"
                );

                showToast(
                    "Policy added successfully."
                );

            } catch (error) {

                showToast(
                    error.message
                );

            }

        }
    );

}


/* =================================================
   LOAD POLICIES
   ================================================= */

function loadPolicies() {

    if (policyUnsubscribe) {

        policyUnsubscribe();

    }


    const q = query(
        dataPath("policies"),
        orderBy(
            "createdAt",
            "desc"
        )
    );


    policyUnsubscribe =
        onSnapshot(
            q,
            snapshot => {

                const list =
                    document.getElementById(
                        "policyList"
                    );

                if (!list) return;


                list.innerHTML = "";


                const policyCount =
                    document.getElementById(
                        "policyCount"
                    );

                if (policyCount) {

                    policyCount.textContent =
                        snapshot.size;

                }


                if (snapshot.empty) {

                    list.innerHTML = `
                        <div class="empty-state large-empty">
                            <div class="empty-icon">▤</div>
                            <strong>No policy records</strong>
                            <span>
                                Add institutional policies, rules or
                                guidelines to create a reliable reference library.
                            </span>
                            <button
                                id="emptyPolicyBtn"
                                class="secondary-btn empty-action"
                                type="button"
                            >
                                Create policy
                            </button>
                        </div>
                    `;

                    attachEmptyStateButtons();

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
                                        data-id="${safeAttribute(item.id)}"
                                        type="button"
                                    >
                                        Delete
                                    </button>

                                `
                                : ""
                            }

                        </div>

                    `;

                });


                attachDeleteButtons(
                    list,
                    "policies"
                );

            },
            error => {

                showToast(
                    error.message
                );

            }
        );

}


/* =================================================
   DELETE BUTTONS
   ================================================= */

function attachDeleteButtons(
    container,
    type
) {

    container
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(button => {

            button.onclick = () => {

                deleteRecord(
                    type,
                    button.dataset.id
                );

            };

        });

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
                DATA_OWNER_UID,
                type,
                id
            )

        );


        showToast(
            "Deleted successfully."
        );

    } catch (error) {

        showToast(
            error.message
        );

    }

}


/* =================================================
   SEARCH
   ================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    ) ||
    document.getElementById(
        "meetingSearch"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        e => {

            const text =
                e.target.value
                    .toLowerCase()
                    .trim();


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

}


/* =================================================
   TOAST
   ================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;


    const content =
        toast.querySelector(
            ".toast-content span"
        );


    if (content) {

        content.textContent =
            message;

    } else {

        toast.textContent =
            message;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ================= TOAST CLOSE ================= */

const toastClose =
    document.querySelector(
        ".toast-close"
    );

if (toastClose) {

    toastClose.onclick = () => {

        const toast =
            document.getElementById(
                "toast"
            );

        if (toast) {

            toast.classList.remove(
                "show"
            );

        }

    };

}


/* =================================================
   STOP REALTIME LISTENERS
   ================================================= */

function stopListeners() {

    if (meetingUnsubscribe) {

        meetingUnsubscribe();
        meetingUnsubscribe = null;

    }


    if (eventUnsubscribe) {

        eventUnsubscribe();
        eventUnsubscribe = null;

    }


    if (policyUnsubscribe) {

        policyUnsubscribe();
        policyUnsubscribe = null;

    }

}


/* =================================================
   SECURITY: ESCAPE HTML
   ================================================= */

function safe(value) {

    return String(
        value ?? ""
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


function safeAttribute(value) {

    return safe(value);

}


/* =================================================
   SAFE URL
   ================================================= */

function isSafeUrl(value) {

    try {

        const url =
            new URL(
                value,
                window.location.href
            );

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;

    }

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
            "Incorrect email or password.",

        "auth/user-not-found":
            "No account found with this email.",

        "auth/wrong-password":
            "Incorrect email or password.",

        "auth/network-request-failed":
            "Network error. Check your internet connection."

    };


    return (
        errors[error.code] ||
        error.message ||
        "Something went wrong."
    );

}


showPage(
    "dashboard"
);