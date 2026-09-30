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
    getDoc,
    updateDoc,
    where
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
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


/* =========================================================
   ADMIN UID
   ========================================================= */

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
let problemUnsubscribe = null;
let feedbackUnsubscribe = null;

let selectedProblemId = null;
let toastTimer = null;


/* =========================================================
   AUTH ELEMENTS
   ========================================================= */

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


/* =========================================================
   FIRESTORE PATH
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
   GENERIC MODAL CLOSE
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const closeButton =
            event.target.closest("[data-close]");

        if (!closeButton) {
            return;
        }

        const modalId =
            closeButton.dataset.close;

        const modal =
            document.getElementById(modalId);

        if (modal) {
            modal.classList.add("hidden");
        }

    }
);


/* =========================================================
   CREATE STUDENT PROBLEM EDIT MODAL
   ========================================================= */

function createStudentProblemModal() {

    if (
        document.getElementById(
            "studentProblemEditModal"
        )
    ) {
        return;
    }

    const modal =
        document.createElement("div");

    modal.id =
        "studentProblemEditModal";

    modal.className =
        "modal hidden";

    modal.innerHTML = `

        <div class="modal-content">

            <div class="modal-header">

                <div>

                    <h2>
                        Edit Problem / Feedback
                    </h2>

                    <p>
                        Update your problem details
                        or send feedback to the administration.
                    </p>

                </div>

                <button
                    type="button"
                    class="modal-close"
                    data-close="studentProblemEditModal"
                >
                    ×
                </button>

            </div>


            <form id="studentProblemEditForm">

                <input
                    type="hidden"
                    id="studentEditProblemId"
                >


                <label>
                    Problem Title
                </label>

                <input
                    type="text"
                    id="studentEditProblemTitle"
                    required
                >


                <label>
                    Category
                </label>

                <select
                    id="studentEditProblemCategory"
                    required
                >

                    <option value="">
                        Select Category
                    </option>

                    <option value="Academic">
                        Academic
                    </option>

                    <option value="Infrastructure">
                        Infrastructure
                    </option>

                    <option value="Hostel">
                        Hostel
                    </option>

                    <option value="Library">
                        Library
                    </option>

                    <option value="Fees">
                        Fees
                    </option>

                    <option value="Technical">
                        Technical
                    </option>

                    <option value="Other">
                        Other
                    </option>

                </select>


                <label>
                    Priority
                </label>

                <select
                    id="studentEditProblemPriority"
                    required
                >

                    <option value="Low">
                        Low
                    </option>

                    <option value="Medium">
                        Medium
                    </option>

                    <option value="High">
                        High
                    </option>

                    <option value="Urgent">
                        Urgent
                    </option>

                </select>


                <label>
                    Problem Description
                </label>

                <textarea
                    id="studentEditProblemDescription"
                    rows="5"
                    required
                ></textarea>


                <label>
                    Feedback
                </label>

                <textarea
                    id="studentProblemFeedback"
                    rows="5"
                    placeholder="Enter feedback, additional information or response..."
                ></textarea>


                <div
                    id="studentProblemAdminResponse"
                    class="problem-response"
                    style="display:none;"
                ></div>


                <div class="modal-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        data-close="studentProblemEditModal"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        class="primary-btn"
                    >
                        Save Changes
                    </button>

                </div>

            </form>

        </div>

    `;

    document.body.appendChild(modal);
}

createStudentProblemModal();


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
                modal.classList.remove("hidden");
            }

        }
    );

}


/* =========================================================
   ADD NEW PROBLEM
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
                        .getElementById("problemTitle")
                        .value
                        .trim();

                const category =
                    document
                        .getElementById("problemCategory")
                        .value;

                const priority =
                    document
                        .getElementById("problemPriority")
                        .value;

                const description =
                    document
                        .getElementById("problemDescription")
                        .value
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

                        priority: priority,

                        description: description,

                        submittedBy:
                            auth.currentUser.uid,

                        submittedByEmail:
                            auth.currentUser.email || "",

                        status:
                            "Pending",

                        adminResponse:
                            "",

                        studentFeedback:
                            "",

                        createdAt:
                            Date.now(),

                        updatedAt:
                            Date.now(),

                        feedbackUpdatedAt:
                            null,

                        respondedBy:
                            "",

                        respondedAt:
                            null,

                        resolvedAt:
                            null

                    }
                );


                problemForm.reset();

                closeModal(
                    "problemModal"
                );

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
                    getErrorMessage(error)
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

    if (!auth.currentUser) {
        return;
    }

    let q;

    if (isAdmin) {

        q =
            query(
                dataPath("problems")
            );

    } else {

        q =
            query(
                dataPath("problems"),
                where(
                    "submittedBy",
                    "==",
                    auth.currentUser.uid
                )
            );

    }


    problemUnsubscribe =
        onSnapshot(

            q,

            snapshot => {

                renderProblems(snapshot);

            },

            error => {

                console.error(
                    "PROBLEM LOAD ERROR:",
                    error
                );

                showToast(
                    "Problems error: " +
                    getErrorMessage(error)
                );

            }

        );

}


/* =========================================================
   RENDER PROBLEMS
   ========================================================= */

function renderProblems(snapshot) {

    const list =
        document.getElementById(
            "problemList"
        );

    if (!list) {
        return;
    }


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


    const totalCount =
        document.getElementById(
            "problemTotalCount"
        );

    const pendingCount =
        document.getElementById(
            "problemPendingCount"
        );

    const reviewCount =
        document.getElementById(
            "problemReviewCount"
        );

    const resolvedCount =
        document.getElementById(
            "problemResolvedCount"
        );


    if (totalCount) {
        totalCount.textContent =
            snapshot.size;
    }

    if (pendingCount) {
        pendingCount.textContent =
            pending;
    }

    if (reviewCount) {
        reviewCount.textContent =
            review;
    }

    if (resolvedCount) {
        resolvedCount.textContent =
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
                    Students can report college-related
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
                ).toLowerCase();


            let studentActions = "";


            if (
                !isAdmin &&
                auth.currentUser &&
                problem.submittedBy ===
                auth.currentUser.uid
            ) {

                studentActions = `

                    <div class="problem-actions">

                        <button
                            type="button"
                            class="secondary-btn problem-edit-btn"
                            data-id="${safeAttribute(problem.id)}"
                        >
                            Edit Problem / Feedback
                        </button>

                    </div>

                `;

            }


            let adminActions = "";


            if (isAdmin) {

                adminActions = `

                    <div class="problem-actions">

                        <button
                            type="button"
                            class="secondary-btn problem-review-btn"
                            data-id="${safeAttribute(problem.id)}"
                        >
                            Review / Respond
                        </button>

                        <button
                            type="button"
                            class="delete-btn problem-delete-btn"
                            data-id="${safeAttribute(problem.id)}"
                        >
                            Delete
                        </button>

                    </div>

                `;

            }


            let feedbackHTML = "";


            if (
                problem.studentFeedback
            ) {

                feedbackHTML = `

                    <div class="problem-response">

                        <div class="problem-response-title">
                            Student Feedback
                        </div>

                        <p>
                            ${safe(
                    problem.studentFeedback
                )}
                        </p>

                    </div>

                `;

            }


            let responseHTML = "";


            if (
                problem.adminResponse
            ) {

                responseHTML = `

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

                `;

            }


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
                problem.title
            )}
                </h3>


                <p class="problem-description">
                    ${safe(
                problem.description
            )}
                </p>


                ${isAdmin
                    ? `

                        <div class="problem-user">

                            <strong>
                                Submitted by:
                            </strong>

                            ${safe(
                        problem.submittedByEmail ||
                        "Student"
                    )}

                        </div>

                    `
                    : ""
                }


                ${responseHTML}

                ${feedbackHTML}

                ${studentActions}

                ${adminActions}

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

    if (
        status ===
        "Resolved"
    ) {
        return "resolved";
    }

    if (
        status ===
        "Under Review"
    ) {
        return "review";
    }

    return "pending";
}


/* =========================================================
   ATTACH PROBLEM BUTTONS
   ========================================================= */

function attachProblemButtons() {

    document
        .querySelectorAll(
            ".problem-edit-btn"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        openStudentProblemEdit(
                            button.dataset.id
                        );

                    };

            }
        );


    document
        .querySelectorAll(
            ".problem-review-btn"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

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

                button.onclick =
                    () => {

                        deleteProblem(
                            button.dataset.id
                        );

                    };

            }
        );

}


/* =========================================================
   OPEN STUDENT PROBLEM EDIT
   ========================================================= */

async function openStudentProblemEdit(
    problemId
) {

    if (!auth.currentUser) {

        showToast(
            "Please login first."
        );

        return;
    }


    try {

        const q =
            query(
                dataPath("problems"),
                where(
                    "submittedBy",
                    "==",
                    auth.currentUser.uid
                )
            );


        const snapshot =
            await getDocs(q);


        let problemData = null;


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

            showToast(
                "Problem not found or access denied."
            );

            return;
        }


        document
            .getElementById(
                "studentEditProblemId"
            )
            .value =
            problemId;


        document
            .getElementById(
                "studentEditProblemTitle"
            )
            .value =
            problemData.title || "";


        document
            .getElementById(
                "studentEditProblemCategory"
            )
            .value =
            problemData.category || "";


        document
            .getElementById(
                "studentEditProblemPriority"
            )
            .value =
            problemData.priority ||
            "Medium";


        document
            .getElementById(
                "studentEditProblemDescription"
            )
            .value =
            problemData.description || "";


        document
            .getElementById(
                "studentProblemFeedback"
            )
            .value =
            problemData.studentFeedback || "";


        const responseBox =
            document.getElementById(
                "studentProblemAdminResponse"
            );


        if (responseBox) {

            if (
                problemData.adminResponse
            ) {

                responseBox.style.display =
                    "block";

                responseBox.innerHTML = `

                    <div class="problem-response-title">
                        Admin Response
                    </div>

                    <p>
                        ${safe(
                    problemData.adminResponse
                )}
                    </p>

                    <p>
                        <strong>
                            Status:
                        </strong>

                        ${safe(
                    problemData.status ||
                    "Pending"
                )}
                    </p>

                `;

            } else {

                responseBox.style.display =
                    "none";

                responseBox.innerHTML =
                    "";

            }

        }


        const modal =
            document.getElementById(
                "studentProblemEditModal"
            );


        if (modal) {

            modal.classList.remove(
                "hidden"
            );

        }


    } catch (error) {

        console.error(
            "OPEN STUDENT PROBLEM ERROR:",
            error
        );

        showToast(
            "Could not open problem: " +
            getErrorMessage(error)
        );

    }

}


/* =========================================================
   STUDENT PROBLEM EDIT FORM
   ========================================================= */

const studentProblemEditForm =
    document.getElementById(
        "studentProblemEditForm"
    );


if (studentProblemEditForm) {

    studentProblemEditForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!auth.currentUser) {

                showToast(
                    "Please login first."
                );

                return;
            }


            const problemId =
                document
                    .getElementById(
                        "studentEditProblemId"
                    )
                    .value;


            if (!problemId) {

                showToast(
                    "Problem not selected."
                );

                return;
            }


            try {

                const problemRef =
                    doc(
                        db,
                        "users",
                        DATA_OWNER_UID,
                        "problems",
                        problemId
                    );


                const currentSnapshot =
                    await getDoc(
                        problemRef
                    );


                if (
                    !currentSnapshot.exists()
                ) {

                    showToast(
                        "Problem no longer exists."
                    );

                    return;
                }


                const currentData =
                    currentSnapshot.data();


                if (
                    currentData.submittedBy !==
                    auth.currentUser.uid
                ) {

                    showToast(
                        "You can only edit your own problem."
                    );

                    return;
                }


                const title =
                    document
                        .getElementById(
                            "studentEditProblemTitle"
                        )
                        .value
                        .trim();


                const category =
                    document
                        .getElementById(
                            "studentEditProblemCategory"
                        )
                        .value;


                const priority =
                    document
                        .getElementById(
                            "studentEditProblemPriority"
                        )
                        .value;


                const description =
                    document
                        .getElementById(
                            "studentEditProblemDescription"
                        )
                        .value
                        .trim();


                const feedback =
                    document
                        .getElementById(
                            "studentProblemFeedback"
                        )
                        .value
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


                const oldFeedback =
                    currentData.studentFeedback ||
                    "";


                const feedbackChanged =
                    oldFeedback !==
                    feedback;


                await updateDoc(
                    problemRef,
                    {

                        title: title,

                        category: category,

                        priority: priority,

                        description: description,

                        studentFeedback:
                            feedback,

                        updatedAt:
                            Date.now(),

                        feedbackUpdatedAt:
                            feedbackChanged
                                ? Date.now()
                                : (
                                    currentData.feedbackUpdatedAt ||
                                    null
                                )

                    }
                );


                closeModal(
                    "studentProblemEditModal"
                );


                showToast(
                    "Problem and feedback updated successfully."
                );


            } catch (error) {

                console.error(
                    "STUDENT UPDATE ERROR:",
                    error
                );

                showToast(
                    "Could not update problem: " +
                    getErrorMessage(error)
                );

            }

        }
    );

}


/* =========================================================
   OPEN ADMIN RESPONSE MODAL
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

        const problemRef =
            doc(
                db,
                "users",
                DATA_OWNER_UID,
                "problems",
                problemId
            );


        const snapshot =
            await getDoc(
                problemRef
            );


        if (!snapshot.exists()) {

            showToast(
                "Problem not found."
            );

            return;
        }


        const problemData =
            snapshot.data();


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
                    <strong>
                        Category:
                    </strong>

                    ${safe(
                problemData.category
            )}
                </p>

                <p>
                    <strong>
                        Priority:
                    </strong>

                    ${safe(
                problemData.priority
            )}
                </p>

                <p>
                    <strong>
                        Student:
                    </strong>

                    ${safe(
                problemData.submittedByEmail
            )}
                </p>

                <p>
                    <strong>
                        Problem:
                    </strong>

                    <br>

                    ${safe(
                problemData.description
            )}
                </p>

                <div class="problem-response">

                    <div class="problem-response-title">
                        Student Feedback
                    </div>

                    ${problemData.studentFeedback
                    ? `
                            <p>
                                ${safe(
                        problemData.studentFeedback
                    )}
                            </p>
                        `
                    : `
                            <p>
                                No feedback submitted yet.
                            </p>
                        `
                }

                </div>

            `;

        }


        const statusElement =
            document.getElementById(
                "problemStatus"
            );


        if (statusElement) {

            statusElement.value =
                problemData.status ||
                "Pending";

        }


        const responseElement =
            document.getElementById(
                "adminResponse"
            );


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
            "OPEN ADMIN RESPONSE ERROR:",
            error
        );

        showToast(
            "Could not open problem: " +
            getErrorMessage(error)
        );

    }

}


/* =========================================================
   ADMIN RESPONSE
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

                const status =
                    document
                        .getElementById(
                            "problemStatus"
                        )
                        .value;


                const response =
                    document
                        .getElementById(
                            "adminResponse"
                        )
                        .value
                        .trim();


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


                await updateDoc(
                    problemRef,
                    {

                        status: status,

                        adminResponse:
                            response,

                        respondedBy:
                            auth.currentUser.uid,

                        respondedAt:
                            Date.now(),

                        updatedAt:
                            Date.now(),

                        resolvedAt:
                            status === "Resolved"
                                ? Date.now()
                                : null

                    }
                );


                closeModal(
                    "problemResponseModal"
                );


                selectedProblemId =
                    null;


                showToast(
                    status === "Resolved"
                        ? "Problem resolved successfully."
                        : "Problem response updated successfully."
                );


            } catch (error) {

                console.error(
                    "ADMIN UPDATE ERROR:",
                    error
                );

                showToast(
                    "Could not update problem: " +
                    getErrorMessage(error)
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


    if (
        !confirm(
            "Are you sure you want to delete this problem?"
        )
    ) {
        return;
    }


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
            getErrorMessage(error)
        );

    }

}


/* =========================================================
   PROBLEM SEARCH
   ========================================================= */

if (problemSearch) {

    problemSearch.addEventListener(
        "input",
        () => {

            const searchText =
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
                            text.includes(
                                searchText
                            )
                                ? ""
                                : "none";

                    }
                );

        }
    );

}


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

    showSignupButton.onclick =
        () => {

            if (loginBox) {
                loginBox.classList.add(
                    "hidden"
                );
            }

            if (signupBox) {
                signupBox.classList.remove(
                    "hidden"
                );
            }

            if (loginMessage) {
                loginMessage.textContent = "";
            }

        };

}


if (showLoginButton) {

    showLoginButton.onclick =
        () => {

            if (signupBox) {
                signupBox.classList.add(
                    "hidden"
                );
            }

            if (loginBox) {
                loginBox.classList.remove(
                    "hidden"
                );
            }

            if (signupMessage) {
                signupMessage.textContent = "";
            }

        };

}


/* =========================================================
   SIGNUP
   ========================================================= */

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "signupEmail"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "signupPassword"
                    )
                    .value;


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
                        getErrorMessage(
                            error
                        );

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
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


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
                        getErrorMessage(
                            error
                        );

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

            isAdmin =
                false;


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


            stopListeners();

            updateAdminUI();

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
                user.email ||
                "User";

        }


        if (userAvatar) {

            userAvatar.textContent =
                (
                    user.email ||
                    "U"
                )
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


        loadMeetings();
        loadEvents();
        loadPolicies();
        loadProblems();
        loadFeedback();

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

    logoutBtn.onclick =
        async () => {

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

    const adminButtons = [

        "addMeetingBtn",
        "dashboardMeetingBtn",
        "addEventBtn",
        "addPolicyBtn"

    ];


    adminButtons.forEach(
        id => {

            const button =
                document.getElementById(id);


            if (!button) {
                return;
            }


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

                showPage(page);

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
            "Problems & Feedback",

        feedback:
            "Feedback"

    };


    if (pageTitle) {

        pageTitle.textContent =
            titles[page] ||
            "Dashboard";

    }


    /* Load feedback whenever Feedback page opens */

    if (
        page === "feedback" &&
        auth.currentUser
    ) {

        loadFeedback();

    }

}


/* =========================================================
   MODAL FUNCTIONS
   ========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

}


function openAdminModal(id) {

    if (!isAdmin) {

        showToast(
            "Only admin can perform this action."
        );

        return;
    }

    openModal(id);

}


function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   ADD MEETING BUTTON
   ========================================================= */

const addMeetingBtn =
    document.getElementById(
        "addMeetingBtn"
    );


if (addMeetingBtn) {

    addMeetingBtn.onclick =
        () => {

            openAdminModal(
                "meetingModal"
            );

        };

}


const dashboardMeetingBtn =
    document.getElementById(
        "dashboardMeetingBtn"
    );


if (dashboardMeetingBtn) {

    dashboardMeetingBtn.onclick =
        () => {

            openAdminModal(
                "meetingModal"
            );

        };

}


/* =========================================================
   ADD EVENT BUTTON
   ========================================================= */

const addEventBtn =
    document.getElementById(
        "addEventBtn"
    );


if (addEventBtn) {

    addEventBtn.onclick =
        () => {

            openAdminModal(
                "eventModal"
            );

        };

}


/* =========================================================
   ADD POLICY BUTTON
   ========================================================= */

const addPolicyBtn =
    document.getElementById(
        "addPolicyBtn"
    );


if (addPolicyBtn) {

    addPolicyBtn.onclick =
        () => {

            openAdminModal(
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

        emptyMeetingBtn.onclick =
            () => {

                openAdminModal(
                    "meetingModal"
                );

            };

    }


    const emptyEventBtn =
        document.getElementById(
            "emptyEventBtn"
        );


    if (emptyEventBtn) {

        emptyEventBtn.onclick =
            () => {

                openAdminModal(
                    "eventModal"
                );

            };

    }


    const emptyPolicyBtn =
        document.getElementById(
            "emptyPolicyBtn"
        );


    if (emptyPolicyBtn) {

        emptyPolicyBtn.onclick =
            () => {

                openAdminModal(
                    "policyModal"
                );

            };

    }

}


attachEmptyStateButtons();


/* =========================================================
   MEETING FORM
   ========================================================= */

const meetingForm =
    document.getElementById(
        "meetingForm"
    );


if (meetingForm) {

    meetingForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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

                console.error(error);

                showToast(
                    getErrorMessage(error)
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


    if (!auth.currentUser) {
        return;
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


                if (!list) {
                    return;
                }


                list.innerHTML = "";


                if (recent) {
                    recent.innerHTML = "";
                }


                const meetingCount =
                    document.getElementById(
                        "meetingCount"
                    );


                if (meetingCount) {

                    meetingCount.textContent =
                        snapshot.size;

                }


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
                                institutional history.
                            </span>

                            ${isAdmin
                            ? `
                                    <button
                                        id="emptyMeetingBtn"
                                        class="secondary-btn empty-action"
                                        type="button"
                                    >
                                        Create meeting
                                    </button>
                                `
                            : ""
                        }

                        </div>

                    `;


                    attachEmptyStateButtons();

                    return;
                }


                let recentIndex = 0;


                snapshot.forEach(
                    item => {

                        const meeting =
                            item.data();


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
                                    </strong>
                                    <br>

                                    ${safe(
                            meeting.agenda
                        )}
                                </p>

                                <p>
                                    <strong>
                                        Minutes / Decision:
                                    </strong>
                                    <br>

                                    ${safe(
                            meeting.minutes ||
                            "Not added"
                        )}
                                </p>

                                ${meeting.action
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


                                ${isAdmin
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


                        if (
                            recent &&
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


                attachDeleteButtons(
                    list,
                    "meetings"
                );

            },

            error => {

                console.error(error);

                showToast(
                    getErrorMessage(error)
                );

            }
        );

}


/* =========================================================
   EVENT FORM
   ========================================================= */

const eventForm =
    document.getElementById(
        "eventForm"
    );


if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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
                    getErrorMessage(error)
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


    if (!auth.currentUser) {
        return;
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


                if (!list) {
                    return;
                }


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

                            ${isAdmin
                            ? `
                                    <button
                                        id="emptyEventBtn"
                                        class="secondary-btn empty-action"
                                        type="button"
                                    >
                                        Create event
                                    </button>
                                `
                            : ""
                        }

                        </div>

                    `;


                    attachEmptyStateButtons();

                    return;
                }


                snapshot.forEach(
                    item => {

                        const eventData =
                            item.data();


                        list.innerHTML += `

                            <div class="record-card">

                                <h3>
                                    ${safe(
                            eventData.title
                        )}
                                </h3>

                                <p>
                                    📅
                                    ${safe(
                            eventData.date
                        )}
                                </p>

                                <p>
                                    📍
                                    ${safe(
                            eventData.location
                        )}
                                </p>

                                <p>
                                    ${safe(
                            eventData.description
                        )}
                                </p>


                                ${eventData.speaker
                            ? `

                                        <p>
                                            🎤
                                            <strong>
                                                Speaker:
                                            </strong>

                                            ${safe(
                                eventData.speaker
                            )}
                                        </p>

                                    `
                            : ""
                        }


                                ${eventData.archiveLink &&
                                isSafeUrl(
                                    eventData.archiveLink
                                )
                            ? `

                                        <p>

                                            🔗

                                            <a
                                                href="${safeAttribute(
                                eventData.archiveLink
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


                                ${isAdmin
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

                    }
                );


                attachDeleteButtons(
                    list,
                    "events"
                );

            },

            error => {

                showToast(
                    getErrorMessage(error)
                );

            }
        );

}


/* =========================================================
   POLICY FORM
   ========================================================= */

const policyForm =
    document.getElementById(
        "policyForm"
    );


if (policyForm) {

    policyForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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
                    getErrorMessage(error)
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


    if (!auth.currentUser) {
        return;
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


                if (!list) {
                    return;
                }


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
                                Add institutional policies,
                                rules or guidelines.
                            </span>

                            ${isAdmin
                            ? `
                                    <button
                                        id="emptyPolicyBtn"
                                        class="secondary-btn empty-action"
                                        type="button"
                                    >
                                        Create policy
                                    </button>
                                `
                            : ""
                        }

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


                                ${isAdmin
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

                    }
                );


                attachDeleteButtons(
                    list,
                    "policies"
                );

            },

            error => {

                showToast(
                    getErrorMessage(error)
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

                button.onclick =
                    () => {

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


    if (
        !confirm(
            "Delete this record?"
        )
    ) {
        return;
    }


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
            getErrorMessage(error)
        );

    }

}


/* =========================================================
   =========================================================
   FEEDBACK SYSTEM
   =========================================================
   ========================================================= */


/*
 * Your HTML already contains:
 *
 * feedbackPage
 * addFeedbackBtn
 * feedbackModal
 * feedbackForm
 * feedbackType
 * feedbackRecord
 * feedbackRating
 * feedbackVisibility
 * feedbackMessage
 *
 * This section connects all of them to Firebase.
 */


const addFeedbackBtn =
    document.getElementById(
        "addFeedbackBtn"
    );

const feedbackModal =
    document.getElementById(
        "feedbackModal"
    );

const feedbackForm =
    document.getElementById(
        "feedbackForm"
    );

const feedbackType =
    document.getElementById(
        "feedbackType"
    );

const feedbackRecord =
    document.getElementById(
        "feedbackRecord"
    );

const feedbackRating =
    document.getElementById(
        "feedbackRating"
    );

const feedbackVisibility =
    document.getElementById(
        "feedbackVisibility"
    );

const feedbackMessage =
    document.getElementById(
        "feedbackMessage"
    );


/* =========================================================
   OPEN FEEDBACK MODAL
   ========================================================= */

if (addFeedbackBtn) {

    addFeedbackBtn.addEventListener(
        "click",
        async () => {

            if (!auth.currentUser) {

                showToast(
                    "Please login first."
                );

                return;
            }


            if (feedbackForm) {
                feedbackForm.reset();
            }


            if (feedbackRecord) {

                feedbackRecord.innerHTML = `

                    <option value="">
                        Select a record
                    </option>

                `;

            }


            if (feedbackModal) {

                feedbackModal.classList.remove(
                    "hidden"
                );

            }


            await loadFeedbackRecords();

        }
    );

}


/* =========================================================
   FEEDBACK TYPE CHANGE
   ========================================================= */

if (feedbackType) {

    feedbackType.addEventListener(
        "change",
        async () => {

            await loadFeedbackRecords();

        }
    );

}


/* =========================================================
   LOAD MEETINGS / EVENTS / POLICIES
   INTO FEEDBACK DROPDOWN
   ========================================================= */

async function loadFeedbackRecords() {

    if (!feedbackRecord) {
        return;
    }


    const type =
        feedbackType
            ? feedbackType.value
            : "Meeting";


    const collectionNameMap = {

        Meeting: "meetings",

        Event: "events",

        Policy: "policies"

    };


    const collectionName =
        collectionNameMap[type];


    if (!collectionName) {

        feedbackRecord.innerHTML = `

            <option value="">
                Select a record
            </option>

        `;

        return;
    }


    feedbackRecord.innerHTML = `

        <option value="">
            Loading records...
        </option>

    `;


    try {

        const snapshot =
            await getDocs(
                dataPath(collectionName)
            );


        if (snapshot.empty) {

            feedbackRecord.innerHTML = `

                <option value="">
                    No ${safe(type.toLowerCase())} records available
                </option>

            `;

            return;
        }


        const records = [];


        snapshot.forEach(
            item => {

                const data =
                    item.data();


                records.push({

                    id: item.id,

                    title:
                        data.title ||
                        "Untitled",

                    date:
                        data.date ||
                        "",

                    location:
                        data.location ||
                        data.venue ||
                        ""

                });

            }
        );


        records.sort(
            (a, b) =>
                String(b.date || "").localeCompare(
                    String(a.date || "")
                )
        );


        feedbackRecord.innerHTML = `

            <option value="">
                Select a ${safe(type.toLowerCase())}
            </option>

        `;


        records.forEach(
            record => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    record.id;


                option.dataset.title =
                    record.title;


                option.textContent =
                    record.date
                        ? `${record.title} — ${record.date}`
                        : record.title;


                feedbackRecord.appendChild(
                    option
                );

            }
        );


    } catch (error) {

        console.error(
            "LOAD FEEDBACK RECORDS ERROR:",
            error
        );


        feedbackRecord.innerHTML = `

            <option value="">
                Could not load records
            </option>

        `;


        showToast(
            "Could not load feedback records: " +
            getErrorMessage(error)
        );

    }

}


/* =========================================================
   SUBMIT FEEDBACK
   ========================================================= */

if (feedbackForm) {

    feedbackForm.addEventListener(
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

                /*
                 * Read every field safely.
                 */

                const type =
                    feedbackType
                        ? feedbackType.value.trim()
                        : "";


                const recordId =
                    feedbackRecord
                        ? feedbackRecord.value.trim()
                        : "";


                const rating =
                    feedbackRating
                        ? Number(
                            feedbackRating.value
                        )
                        : 0;


                const visibility =
                    feedbackVisibility
                        ? feedbackVisibility.value
                        : "Identified";


                const message =
                    feedbackMessage
                        ? feedbackMessage.value.trim()
                        : "";


                /*
                 * IMPORTANT:
                 * These validations prevent the
                 * "missing or insufficient information"
                 * error caused by incomplete feedback data.
                 */

                if (!type) {

                    showToast(
                        "Please select feedback type."
                    );

                    return;
                }


                if (!recordId) {

                    showToast(
                        "Please select a meeting, event or policy."
                    );

                    return;
                }


                if (
                    !rating ||
                    rating < 1 ||
                    rating > 5
                ) {

                    showToast(
                        "Please select a rating from 1 to 5."
                    );

                    return;
                }


                if (!message) {

                    showToast(
                        "Please enter your feedback."
                    );

                    return;
                }


                /*
                 * Get selected record title.
                 */

                let recordTitle =
                    "";


                if (feedbackRecord) {

                    const selectedOption =
                        feedbackRecord
                            .options[
                                feedbackRecord
                                    .selectedIndex
                            ];


                    if (selectedOption) {

                        recordTitle =
                            selectedOption.dataset.title ||
                            selectedOption.textContent ||
                            "";

                    }

                }


                /*
                 * Store feedback.
                 *
                 * submittedBy is always stored so
                 * Firestore rules can restrict students
                 * to their own feedback.
                 *
                 * For Anonymous visibility we simply
                 * hide the email from the UI.
                 */

                const feedbackData = {

                    type:
                        type,

                    recordId:
                        recordId,

                    recordTitle:
                        recordTitle,

                    rating:
                        rating,

                    message:
                        message,

                    visibility:
                        visibility,

                    submittedBy:
                        auth.currentUser.uid,

                    submittedByEmail:
                        visibility === "Anonymous"
                            ? ""
                            : (
                                auth.currentUser.email ||
                                ""
                            ),

                    createdAt:
                        Date.now()

                };


                /*
                 * THIS is the Firebase write.
                 */

                await addDoc(
                    dataPath("feedback"),
                    feedbackData
                );


                /*
                 * Reset form.
                 */

                feedbackForm.reset();


                /*
                 * Restore default dropdown.
                 */

                if (feedbackRecord) {

                    feedbackRecord.innerHTML = `

                        <option value="">
                            Select a record
                        </option>

                    `;

                }


                closeModal(
                    "feedbackModal"
                );


                showToast(
                    "Feedback submitted successfully."
                );


                /*
                 * Refresh feedback list.
                 */

                loadFeedback();


            } catch (error) {

                console.error(
                    "FEEDBACK SUBMIT ERROR:",
                    error
                );


                /*
                 * Specific Firebase permission message.
                 */

                if (
                    error.code ===
                    "permission-denied"
                ) {

                    showToast(
                        "Feedback permission denied. Update your Firestore Rules."
                    );

                } else {

                    showToast(
                        "Could not submit feedback: " +
                        getErrorMessage(error)
                    );

                }

            }

        }
    );

}


/* =========================================================
   LOAD FEEDBACK
   ========================================================= */

function loadFeedback() {

    if (feedbackUnsubscribe) {

        feedbackUnsubscribe();

        feedbackUnsubscribe = null;

    }


    if (!auth.currentUser) {
        return;
    }


    let feedbackQuery;


    /*
     * ADMIN:
     * Can see all feedback.
     */

    if (isAdmin) {

        feedbackQuery =
            query(
                dataPath("feedback"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );

    }


    /*
     * STUDENT:
     * Only see their own feedback.
     */

    else {

        feedbackQuery =
            query(
                dataPath("feedback"),
                where(
                    "submittedBy",
                    "==",
                    auth.currentUser.uid
                )
            );

    }


    feedbackUnsubscribe =
        onSnapshot(

            feedbackQuery,

            snapshot => {

                renderFeedback(snapshot);

            },

            error => {

                console.error(
                    "FEEDBACK LOAD ERROR:",
                    error
                );


                const list =
                    document.getElementById(
                        "feedbackList"
                    );


                if (list) {

                    list.innerHTML = `

                        <div class="empty-state large-empty">

                            <strong>
                                Could not load feedback
                            </strong>

                            <span>
                                ${safe(
                        getErrorMessage(error)
                    )}
                            </span>

                        </div>

                    `;

                }


                if (
                    error.code ===
                    "permission-denied"
                ) {

                    showToast(
                        "Feedback read permission denied. Check Firestore Rules."
                    );

                }

            }

        );

}


/* =========================================================
   RENDER FEEDBACK
   ========================================================= */

function renderFeedback(snapshot) {

    const list =
        document.getElementById(
            "feedbackList"
        );


    if (!list) {
        return;
    }


    if (snapshot.empty) {

        list.innerHTML = `

            <div class="empty-state large-empty">

                <div class="empty-icon">
                    ★
                </div>

                <strong>
                    No feedback yet
                </strong>

                <span>
                    Share your experience about meetings,
                    events or institutional policies.
                </span>

            </div>

        `;

        return;
    }


    const feedbackItems = [];


    snapshot.forEach(
        item => {

            feedbackItems.push({

                id:
                    item.id,

                ...item.data()

            });

        }
    );


    /*
     * Student query doesn't use orderBy because
     * where + orderBy can require an index.
     * So sort locally.
     */

    feedbackItems.sort(
        (a, b) =>
            Number(
                b.createdAt || 0
            ) -
            Number(
                a.createdAt || 0
            )
    );


    list.innerHTML = "";


    feedbackItems.forEach(
        feedback => {

            const rating =
                Math.max(
                    0,
                    Math.min(
                        5,
                        Number(
                            feedback.rating || 0
                        )
                    )
                );


            const stars =
                "★".repeat(rating) +
                "☆".repeat(5 - rating);


            const identity =
                feedback.visibility ===
                "Anonymous"

                    ? "Anonymous"

                    : (
                        feedback.submittedByEmail ||
                        "Student"
                    );


            const date =
                formatDate(
                    feedback.createdAt
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "record-card feedback-card";


            card.innerHTML = `

                <div class="problem-meta">

                    <span class="problem-badge">
                        ${safe(
                feedback.type ||
                "Feedback"
            )}
                    </span>

                    <span class="problem-status review">
                        ${safe(
                feedback.visibility ||
                "Identified"
            )}
                    </span>

                </div>


                <h3>
                    ${safe(
                feedback.recordTitle ||
                "Institutional Record"
            )}
                </h3>


                <div
                    style="
                        font-size:22px;
                        letter-spacing:2px;
                        margin:8px 0;
                    "
                >
                    ${stars}
                </div>


                <p>
                    ${safe(
                feedback.message ||
                ""
            )}
                </p>


                <div
                    class="problem-user"
                >

                    <strong>
                        Submitted by:
                    </strong>

                    ${safe(identity)}

                </div>


                <small>
                    ${safe(date)}
                </small>

            `;


            list.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "Date not available";
    }


    let date;


    if (
        value &&
        typeof value.toDate ===
        "function"
    ) {

        date =
            value.toDate();

    } else {

        date =
            new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date not available";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

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
        event => {

            const searchText =
                event.target.value
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
                                searchText
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


    if (!toast) {
        return;
    }


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
            3500
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

    toastClose.onclick =
        () => {

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
   STOP FIREBASE LISTENERS
   ========================================================= */

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


    if (problemUnsubscribe) {

        problemUnsubscribe();

        problemUnsubscribe = null;

    }


    if (feedbackUnsubscribe) {

        feedbackUnsubscribe();

        feedbackUnsubscribe = null;

    }

}


/* =========================================================
   HTML SECURITY
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

function getErrorMessage(error) {

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

        "permission-denied":
            "Permission denied. Check Firestore Rules."

    };


    return (
        errors[error.code] ||
        error.message ||
        "Something went wrong."
    );

}


/* =========================================================
   ESC KEY CLOSE MODAL
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        document
            .querySelectorAll(
                ".modal:not(.hidden)"
            )
            .forEach(
                modal => {

                    modal.classList.add(
                        "hidden"
                    );

                }
            );

    }
);


/* =========================================================
   INITIAL PAGE
   ========================================================= */

showPage(
    "dashboard"
);