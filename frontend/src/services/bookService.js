const API_URL = `${process.env.REACT_APP_API_URL || "http://localhost:4000/api"}/books`;
const AUTH_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

// =========================
// HELPER: ส่ง JWT Token
// =========================

const getAuthHeaders = (includeJson = false) => {
    const token = localStorage.getItem("token");

    const headers = {};

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
};

// =========================
// HELPER: ตรวจสอบผล API
// =========================

const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || data.error || `Request failed: ${response.status}`
        );
    }

    return data;
};

// =========================
// GET ALL BOOKS
// =========================

export const getBooks = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

// =========================
// ADD BOOK
// =========================

export const addBook = async (book) => {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(book)
    });

    return handleResponse(response);
};

// =========================
// UPDATE BOOK
// =========================

export const updateBook = async (id, book) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(book)
    });

    return handleResponse(response);
};

// =========================
// DELETE BOOK
// =========================

export const deleteBook = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

// =========================
// USER REGISTER
// =========================

export const registerUser = async (user) => {
    const response = await fetch(`${AUTH_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    return handleResponse(response);
};

// =========================
// USER LOGIN
// =========================

export const loginUser = async (user) => {
    const response = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
    });

    return handleResponse(response);
};

// =========================
// GET USER PROFILE
// =========================

export const getProfile = async () => {
    const response = await fetch(`${AUTH_URL}/profile`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};