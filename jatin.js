console.log("javascript is running!");

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
    serverTimestamp,
    getDocs,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
   ========================================================= */

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

console.log("Firebase initialized successfully");
console.log("Firestore connected successfully");


/* =========================================================
   ADMIN DATA
   ========================================================= */

const ADMIN_UIDS = [
    "aQ3rE6XskFWueVUFNiR2Oj4GxAZ2",
    "dru1GGXszkVkdAeYAqpoCsDoehF2",
    "N6lVEy0lLbQua6my0Ktokym3AD22"
];

const DATA_OWNER_UID =
    "aQ3rE6XskFWueVUFNiR2Oj4GxAZ2";

let isAdmin = false;


/* =========================================================
   REALTIME LISTENERS
   ========================================================= */

let meetingUnsubscribe = null;
let eventUnsubscribe = null;
let policyUnsubscribe = null;
let problemUnsubscribe = null;

let toastTimer = null;

let selectedProblemId = null;


/* =========================================================
   PROBLEM ELEMENTS
   ========================================================= */

const addProblemBtn =
    document.getElementById("addProblemBtn");

const problemForm =
    document.getElementById("problemForm");

const problemResponseForm =
    document.getElementById("problemResponseForm");

const problemSearch =
    document.getElementById("problemSearch");


/* =========================================================
   DATA PATH
   ========================================================= */

function dataPath(type) {

    return collection(
        db,
        "users",
        DATA_OWNER_UID,
        type
    );

}


/* =========================================================
   ADD PROBLEM BUTTON
   ========================================================= */

if (addProblemBtn) {

    addProblemBtn.addEventListener(
        "click",
        () => {

            const modal =
                document.getElementById(
                    "problemModal"
                );

            if (modal) {

                modal.classList.remove(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   CLOSE MODALS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const closeButton =
            event.target.closest(
                "[data-close]"
            );

        if (!closeButton) return;

        const modalId =
            closeButton.dataset.close;

        const modal =
            document.getElementById(
                modalId
            );

        if (modal) {

            modal.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   ADD PROBLEM
   ========================================================= */

if (problemForm) {

    problemForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!auth.currentUser) {

                showToast(
                    "Please login first."
                );

                return;

            }

            try {

                const title =
                    document
                        .getElementById(
                            "problemTitle"
                        )
                        ?.value
                        .trim();

                const category =
                    document
                        .getElementById(
                            "problemCategory"
                        )
                        ?.value;

                const priority =
                    document
                        .getElementById(
                            "problemPriority"
                        )
                        ?.value;

                const description =
                    document
                        .getElementById(
                            "problemDescription"
                        )
                        ?.value
                        .trim();


                if (
                    !title ||
                    !category ||
                    !description
                ) {

                    showToast(
                        "Please fill all required fields."
                    );

                    return;

                }


                await addDoc(
                    dataPath("problems"),
                    {

                        title: title,

                        category: category,

                        priority:
                            priority || "Medium",

                        description: description,

                        submittedBy:
                            auth.currentUser.uid,

                        submittedByEmail:
                            auth.currentUser.email || "Student",

                        status: "Pending",

                        adminResponse: "",

                        createdAt:
                            Date.now(),

                        resolvedAt: null,

                        respondedBy: "",

                        respondedAt: null

                    }
                );


                problemForm.reset();


                const modal =
                    document.getElementById(
                        "problemModal"
                    );

                if (modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }


                showToast(
                    "Problem submitted successfully."
                );


            } catch (error) {

                console.error(
                    "ADD PROBLEM ERROR:",
                    error
                );

                showToast(
                    "Could not submit problem: " +
                    error.message
                );

            }

        }
    );

}


/* =========================================================
   LOAD PROBLEMS
   ========================================================= */

function loadProblems() {

    if (problemUnsubscribe) {

        problemUnsubscribe();

        problemUnsubscribe = null;

    }


    try {

        const q =
            query(
                dataPath("problems")
            );


        problemUnsubscribe =
            onSnapshot(
                q,

                snapshot => {

                    renderProblems(
                        snapshot
                    );

                },

                error => {

                    console.error(
                        "PROBLEMS FIRESTORE ERROR:",
                        error
                    );

                    showToast(
                        "Problems error: " +
                        error.message
                    );

                }
            );


    } catch (error) {

        console.error(
            "LOAD PROBLEMS ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER PROBLEMS
   ========================================================= */

function renderProblems(snapshot) {

    const list =
        document.getElementById(
            "problemList"
        );

    if (!list) return;


    let total =
        snapshot.size;

    let pending = 0;
    let review = 0;
    let resolved = 0;


    snapshot.forEach(
        item => {

            const problem =
                item.data();


            if (
                problem.status ===
                "Pending"
            ) {

                pending++;

            }


            if (
                problem.status ===
                "Under Review"
            ) {

                review++;

            }


            if (
                problem.status ===
                "Resolved"
            ) {

                resolved++;

            }

        }
    );


    const totalElement =
        document.getElementById(
            "problemTotalCount"
        );

    const pendingElement =
        document.getElementById(
            "problemPendingCount"
        );

    const reviewElement =
        document.getElementById(
            "problemReviewCount"
        );

    const resolvedElement =
        document.getElementById(
            "problemResolvedCount"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }

    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }

    if (reviewElement) {

        reviewElement.textContent =
            review;

    }

    if (resolvedElement) {

        resolvedElement.textContent =
            resolved;

    }


    if (snapshot.empty) {

        list.innerHTML = `
            <div class="empty-state large-empty">

                <div class="empty-icon">
                    ?
                </div>

                <strong>
                    No problems reported
                </strong>

                <span>
                    Students can report their college-related
                    problems here.
                </span>

            </div>
        `;

        return;

    }


    const problems = [];


    snapshot.forEach(
        item => {

            problems.push({

                id: item.id,

                ...item.data()

            });

        }
    );


    problems.sort(
        (a, b) =>
            (b.createdAt || 0) -
            (a.createdAt || 0)
    );


    list.innerHTML = "";


    problems.forEach(
        problem => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "problem-card";


            const statusClass =
                getProblemStatusClass(
                    problem.status
                );


            const priorityClass =
                String(
                    problem.priority ||
                    "Medium"
                )
                    .toLowerCase();


            card.innerHTML = `

                <div class="problem-meta">

                    <span class="problem-badge">
                        ${safe(
                            problem.category ||
                            "Other"
                        )}
                    </span>

                    <span class="problem-priority ${priorityClass}">
                        ${safe(
                            problem.priority ||
                            "Medium"
                        )}
                        Priority
                    </span>

                    <span class="problem-status ${statusClass}">
                        ${safe(
                            problem.status ||
                            "Pending"
                        )}
                    </span>

                </div>


                <h3>
                    ${safe(
                        problem.title ||
                        "Untitled Problem"
                    )}
                </h3>


                <p class="problem-description">
                    ${safe(
                        problem.description
                    )}
                </p>


                <div class="problem-user">

                    <strong>
                        Submitted by:
                    </strong>

                    ${safe(
                        problem.submittedByEmail ||
                        "Student"
                    )}

                </div>


                ${
                    problem.adminResponse
                    ? `

                        <div class="problem-response">

                            <div class="problem-response-title">
                                Admin Response
                            </div>

                            <p>
                                ${safe(
                                    problem.adminResponse
                                )}
                            </p>

                        </div>

                    `
                    : ""
                }


                ${
                    isAdmin
                    ? `

                        <div class="problem-actions">

                            <button
                                type="button"
                                class="secondary-btn problem-review-btn"
                                data-id="${safeAttribute(
                                    problem.id
                                )}"
                            >
                                Review / Respond
                            </button>

                            <button
                                type="button"
                                class="delete-btn problem-delete-btn"
                                data-id="${safeAttribute(
                                    problem.id
                                )}"
                            >
                                Delete
                            </button>

                        </div>

                    `
                    : ""
                }

            `;


            list.appendChild(card);

        }
    );


    attachProblemButtons();

}


/* =========================================================
   PROBLEM STATUS CLASS
   ========================================================= */

function getProblemStatusClass(status) {

    if (status === "Resolved") {

        return "resolved";

    }

    if (status === "Under Review") {

        return "review";

    }

    return "pending";

}


/* =========================================================
   PROBLEM BUTTONS
   ========================================================= */

function attachProblemButtons() {

    document
        .querySelectorAll(
            ".problem-review-btn"
        )
        .forEach(
            button => {

                button.onclick = () => {

                    openProblemResponse(
                        button.dataset.id
                    );

                };

            }
        );


    document
        .querySelectorAll(
            ".problem-delete-btn"
        )
        .forEach(
            button => {

                button.onclick = async () => {

                    await deleteProblem(
                        button.dataset.id
                    );

                };

            }
        );

}


/* =========================================================
   OPEN PROBLEM RESPONSE
   ========================================================= */

async function openProblemResponse(
    problemId
) {

    if (!isAdmin) {

        showToast(
            "Only admin can respond."
        );

        return;

    }


    selectedProblemId =
        problemId;


    try {

        const problemQuery =
            query(
                dataPath("problems")
            );


        const snapshot =
            await getDocs(
                problemQuery
            );


        let problemData =
            null;


        snapshot.forEach(
            item => {

                if (
                    item.id ===
                    problemId
                ) {

                    problemData =
                        item.data();

                }

            }
        );


        if (!problemData) {

            selectedProblemId =
                null;

            showToast(
                "Problem not found."
            );

            return;

        }


        const details =
            document.getElementById(
                "adminProblemDetails"
            );


        if (details) {

            details.innerHTML = `

                <h3>
                    ${safe(
                        problemData.title
                    )}
                </h3>

                <p>
                    <strong>Category:</strong>
                    ${safe(
                        problemData.category
                    )}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${safe(
                        problemData.priority
                    )}
                </p>

                <p>
                    <strong>Student:</strong>
                    ${safe(
                        problemData.submittedByEmail
                    )}
                </p>

                <p>
                    <strong>Problem:</strong><br>
                    ${safe(
                        problemData.description
                    )}
                </p>

            `;

        }


        const statusElement =
            document.getElementById(
                "problemStatus"
            );


        const responseElement =
            document.getElementById(
                "adminResponse"
            );


        if (statusElement) {

            statusElement.value =
                problemData.status ||
                "Pending";

        }


        if (responseElement) {

            responseElement.value =
                problemData.adminResponse ||
                "";

        }


        const modal =
            document.getElementById(
                "problemResponseModal"
            );


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }


    } catch (error) {

        console.error(
            "OPEN PROBLEM ERROR:",
            error
        );

        selectedProblemId =
            null;

        showToast(
            error.message
        );

    }

}


/* =========================================================
   ADMIN RESPONSE / RESOLUTION
   ========================================================= */

if (problemResponseForm) {

    problemResponseForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!isAdmin) {

                showToast(
                    "Only admin can respond."
                );

                return;

            }


            if (!selectedProblemId) {

                showToast(
                    "No problem selected."
                );

                return;

            }


            try {

                const statusElement =
                    document.getElementById(
                        "problemStatus"
                    );


                const responseElement =
                    document.getElementById(
                        "adminResponse"
                    );


                const status =
                    statusElement
                        ? statusElement.value
                        : "Under Review";


                const response =
                    responseElement
                        ? responseElement.value.trim()
                        : "";


                if (!response) {

                    showToast(
                        "Please enter a response."
                    );

                    return;

                }


                const problemRef =
                    doc(
                        db,
                        "users",
                        DATA_OWNER_UID,
                        "problems",
                        selectedProblemId
                    );


                const updateData = {

                    status:
                        status,

                    adminResponse:
                        response,

                    respondedBy:
                        auth.currentUser.uid,

                    respondedAt:
                        Date.now()

                };


                if (
                    status ===
                    "Resolved"
                ) {

                    updateData.resolvedAt =
                        Date.now();

                } else {

                    updateData.resolvedAt =
                        null;

                }


                await updateDoc(
                    problemRef,
                    updateData
                );


                const modal =
                    document.getElementById(
                        "problemResponseModal"
                    );


                if (modal) {

                    modal.classList.add(
                        "hidden"
                    );

                }


                selectedProblemId =
                    null;


                showToast(
                    status === "Resolved"
                        ? "Problem resolved successfully."
                        : "Problem response updated."
                );


            } catch (error) {

                console.error(
                    "UPDATE PROBLEM ERROR:",
                    error
                );

                showToast(
                    "Could not update problem: " +
                    error.message
                );

            }

        }
    );

}


/* =========================================================
   DELETE PROBLEM
   ========================================================= */

async function deleteProblem(
    problemId
) {

    if (!isAdmin) {

        showToast(
            "Only admin can delete problems."
        );

        return;

    }


    const confirmDelete =
        confirm(
            "Delete this problem?"
        );


    if (!confirmDelete)
        return;


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                DATA_OWNER_UID,
                "problems",
                problemId
            )
        );


        showToast(
            "Problem deleted successfully."
        );


    } catch (error) {

        console.error(
            "DELETE PROBLEM ERROR:",
            error
        );

        showToast(
            "Could not delete problem: " +
            error.message
        );

    }

}


/* =========================================================
   SEARCH PROBLEMS
   ========================================================= */

if (problemSearch) {

    problemSearch.addEventListener(
        "input",
        () => {

            const value =
                problemSearch.value
                    .toLowerCase()
                    .trim();


            document
                .querySelectorAll(
                    ".problem-card"
                )
                .forEach(
                    card => {

                        const text =
                            card.textContent
                                .toLowerCase();


                        card.style.display =
                            text.includes(value)
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


/* =========================================================
   AUTH ELEMENTS
   ========================================================= */

const authScreen =
    document.getElementById(
        "authScreen"
    );

const appScreen =
    document.getElementById(
        "app"
    );

const loginBox =
    document.getElementById(
        "loginBox"
    );

const signupBox =
    document.getElementById(
        "signupBox"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const signupForm =
    document.getElementById(
        "signupForm"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const signupMessage =
    document.getElementById(
        "signupMessage"
    );

const userEmail =
    document.getElementById(
        "userEmail"
    );

const userAvatar =
    document.getElementById(
        "userAvatar"
    );

const userRole =
    document.getElementById(
        "userRole"
    );

const pageTitle =
    document.getElementById(
        "pageTitle"
    );


/* =========================================================
   LOGIN / SIGNUP SWITCH
   ========================================================= */

const showSignupButton =
    document.getElementById(
        "showSignup"
    );

const showLoginButton =
    document.getElementById(
        "showLogin"
    );


if (showSignupButton) {

    showSignupButton.onclick = () => {

        if (loginBox)
            loginBox.classList.add(
                "hidden"
            );

        if (signupBox)
            signupBox.classList.remove(
                "hidden"
            );

        if (loginMessage)
            loginMessage.textContent = "";

    };

}


if (showLoginButton) {

    showLoginButton.onclick = () => {

        if (signupBox)
            signupBox.classList.add(
                "hidden"
            );

        if (loginBox)
            loginBox.classList.remove(
                "hidden"
            );

        if (signupMessage)
            signupMessage.textContent = "";

    };

}


/* =========================================================
   SIGNUP
   ========================================================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async e => {

            e.preventDefault();


            const email =
                document
                    .getElementById(
                        "signupEmail"
                    )
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById(
                        "signupPassword"
                    )
                    ?.value;


            if (!email || !password) {

                if (signupMessage) {

                    signupMessage.textContent =
                        "Please enter email and password.";

                }

                return;

            }


            try {

                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                if (signupMessage) {

                    signupMessage.textContent =
                        "Account created successfully.";

                }


                signupForm.reset();


            } catch (error) {

                if (signupMessage) {

                    signupMessage.textContent =
                        getError(error);

                }

            }

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async e => {

            e.preventDefault();


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    ?.value;


            if (!email || !password) {

                if (loginMessage) {

                    loginMessage.textContent =
                        "Please enter email and password.";

                }

                return;

            }


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                if (loginMessage) {

                    loginMessage.textContent =
                        "";

                }


            } catch (error) {

                if (loginMessage) {

                    loginMessage.textContent =
                        getError(error);

                }

            }

        }
    );

}


/* =========================================================
   AUTH STATE
   ========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            isAdmin = false;


            if (authScreen) {

                authScreen.classList.remove(
                    "hidden"
                );

            }


            if (appScreen) {

                appScreen.classList.add(
                    "hidden"
                );

            }


            updateAdminUI();

            stopListeners();

            return;

        }


        if (authScreen) {

            authScreen.classList.add(
                "hidden"
            );

        }


        if (appScreen) {

            appScreen.classList.remove(
                "hidden"
            );

        }


        if (userEmail) {

            userEmail.textContent =
                user.email || "User";

        }


        if (userAvatar) {

            userAvatar.textContent =
                (user.email || "U")
                    .charAt(0)
                    .toUpperCase();

        }


        isAdmin =
            ADMIN_UIDS.includes(
                user.uid
            );


        if (userRole) {

            userRole.textContent =
                isAdmin
                    ? "ADMIN"
                    : "USER";

        }


        updateAdminUI();


        showPage(
            "dashboard"
        );


        /* IMPORTANT */

        loadMeetings();
        loadEvents();
        loadPolicies();
        loadProblems();

    }
);


/* =========================================================
   LOGOUT
   ========================================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.onclick = async () => {

        try {

            await signOut(
                auth
            );

        } catch (error) {

            showToast(
                error.message
            );

        }

    };

}


/* =========================================================
   ADMIN UI
   ========================================================= */

function updateAdminUI() {

    const buttons = [

        "addMeetingBtn",
        "dashboardMeetingBtn",
        "addEventBtn",
        "addPolicyBtn"

    ];


    buttons.forEach(
        id => {

            const button =
                document.getElementById(
                    id
                );


            if (!button)
                return;


            button.style.display =
                isAdmin
                    ? ""
                    : "none";

        }
    );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navButtons =
    document.querySelectorAll(
        ".nav-btn"
    );


navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;


                showPage(
                    page
                );

            }
        );

    }
);


function showPage(page) {

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            section => {

                section.classList.add(
                    "hidden"
                );

                section.classList.remove(
                    "active-page"
                );

            }
        );


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


    navButtons.forEach(
        button => {

            button.classList.remove(
                "active"
            );


            if (
                button.dataset.page ===
                page
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    const titles = {

        dashboard:
            "Dashboard",

        meetings:
            "Meetings",

        events:
            "Events & Archive",

        policies:
            "Policies & Rules",

        problems:
            "Student Problems & Feedback"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[page] ||
            "Dashboard";

    }

}


/* =========================================================
   MODALS
   ========================================================= */

function openModal(id) {

    if (!isAdmin) {

        showToast(
            "Only admin can perform this action."
        );

        return;

    }


    const modal =
        document.getElementById(
            id
        );


    if (!modal)
        return;


    modal.classList.remove(
        "hidden"
    );

}


function closeModal(id) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal)
        return;


    modal.classList.add(
        "hidden"
    );

}


/* =========================================================
   MODAL CLOSE BUTTONS
   ========================================================= */

document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    closeModal(
                        button.dataset.close
                    );

                }
            );

        }
    );


/* =========================================================
   OPEN BUTTONS
   ========================================================= */

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


/* =========================================================
   EMPTY STATE BUTTONS
   ========================================================= */

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


/* =========================================================
   ADD MEETING
   ========================================================= */

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


/* =========================================================
   LOAD MEETINGS
   ========================================================= */

function loadMeetings() {

    if (meetingUnsubscribe) {

        meetingUnsubscribe();

        meetingUnsubscribe = null;

    }


    const q =
        query(
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

                            <div class="empty-icon">
                                ▣
                            </div>

                            <strong>
                                No meeting records
                            </strong>

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

                            <div class="empty-icon">
                                ▣
                            </div>

                            <strong>
                                No meetings yet
                            </strong>

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


                snapshot.forEach(
                    item => {

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
                                            data-id="${safeAttribute(
                                                item.id
                                            )}"
                                            type="button"
                                        >
                                            Delete
                                        </button>

                                    `
                                    : ""
                                }

                            </div>

                        `;


                        if (
                            recentIndex < 5
                        ) {

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

                    }
                );


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

                console.error(
                    "MEETING ERROR:",
                    error
                );

                showToast(
                    error.message
                );

            }
        );

}


/* =========================================================
   ADD EVENT
   ========================================================= */

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


/* =========================================================
   LOAD EVENTS
   ========================================================= */

function loadEvents() {

    if (eventUnsubscribe) {

        eventUnsubscribe();

        eventUnsubscribe = null;

    }


    const q =
        query(
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


                if (!list)
                    return;


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

                            <div class="empty-icon">
                                ◇
                            </div>

                            <strong>
                                No archived events
                            </strong>

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


                snapshot.forEach(
                    item => {

                        const event =
                            item.data();


                        list.innerHTML += `

                            <div class="record-card">

                                <h3>
                                    ${safe(
                                        event.title
                                    )}
                                </h3>

                                <p>
                                    📅
                                    ${safe(
                                        event.date
                                    )}
                                </p>

                                <p>
                                    📍
                                    ${safe(
                                        event.location
                                    )}
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
                                            data-id="${safeAttribute(
                                                item.id
                                            )}"
                                            type="button"
                                        >
                                            Delete
                                        </button>

                                    `
                                    : ""
                                }

                            </div>

                        `;

                    }
                );


                attachDeleteButtons(
                    list,
                    "events"
                );

            },

            error => {

                console.error(
                    "EVENT ERROR:",
                    error
                );

                showToast(
                    error.message
                );

            }
        );

}


/* =========================================================
   ADD POLICY
   ========================================================= */

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


/* =========================================================
   LOAD POLICIES
   ========================================================= */

function loadPolicies() {

    if (policyUnsubscribe) {

        policyUnsubscribe();

        policyUnsubscribe = null;

    }


    const q =
        query(
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


                if (!list)
                    return;


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

                            <div class="empty-icon">
                                ▤
                            </div>

                            <strong>
                                No policy records
                            </strong>

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


                snapshot.forEach(
                    item => {

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
                                            data-id="${safeAttribute(
                                                item.id
                                            )}"
                                            type="button"
                                        >
                                            Delete
                                        </button>

                                    `
                                    : ""
                                }

                            </div>

                        `;

                    }
                );


                attachDeleteButtons(
                    list,
                    "policies"
                );

            },

            error => {

                console.error(
                    "POLICY ERROR:",
                    error
                );

                showToast(
                    error.message
                );

            }
        );

}


/* =========================================================
   DELETE BUTTONS
   ========================================================= */

function attachDeleteButtons(
    container,
    type
) {

    container
        .querySelectorAll(
            ".delete-btn"
        )
        .forEach(
            button => {

                button.onclick = () => {

                    deleteRecord(
                        type,
                        button.dataset.id
                    );

                };

            }
        );

}


/* =========================================================
   DELETE RECORD
   ========================================================= */

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

        console.error(
            "DELETE ERROR:",
            error
        );

        showToast(
            error.message
        );

    }

}


/* =========================================================
   GENERAL SEARCH
   ========================================================= */

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
                .forEach(
                    card => {

                        const content =
                            card.textContent
                                .toLowerCase();


                        card.style.display =
                            content.includes(
                                text
                            )
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast)
        return;


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


/* =========================================================
   TOAST CLOSE
   ========================================================= */

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


/* =========================================================
   STOP REALTIME LISTENERS
   ========================================================= */

function stopListeners() {

    if (meetingUnsubscribe) {

        meetingUnsubscribe();

        meetingUnsubscribe =
            null;

    }


    if (eventUnsubscribe) {

        eventUnsubscribe();

        eventUnsubscribe =
            null;

    }


    if (policyUnsubscribe) {

        policyUnsubscribe();

        policyUnsubscribe =
            null;

    }


    /* IMPORTANT:
       Problems listener also needs
       to stop on logout.
    */

    if (problemUnsubscribe) {

        problemUnsubscribe();

        problemUnsubscribe =
            null;

    }

}


/* =========================================================
   SECURITY: ESCAPE HTML
   ========================================================= */

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


/* =========================================================
   SAFE URL
   ========================================================= */

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


/* =========================================================
   FIREBASE ERROR MESSAGES
   ========================================================= */

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
            "Network error. Check your internet connection.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/user-disabled":
            "This account has been disabled."

    };


    return (
        errors[error.code] ||
        error.message ||
        "Something went wrong."
    );

}


/* =========================================================
   INITIAL PAGE
   ========================================================= */

showPage(
    "dashboard"
);