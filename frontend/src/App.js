import { useEffect, useState } from "react";
import "./App.css";

import BookForm from "./components/BookForm";
import BookTable from "./components/BookTable";
import Register from "./components/Register";
import Login from "./components/Login";

import {
    getBooks,
    addBook,
    updateBook,
    deleteBook,
    registerUser,
    loginUser
} from "./services/bookService";

function App() {
    const [books, setBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);

    // ตรวจสอบ Role ของผู้ใช้
    const role = user?.role;

    const canEdit = role === "editor" || role === "admin";
    const canDelete = role === "admin";

    // =========================
    // LOAD BOOKS
    // =========================

    const loadBooks = async () => {
        try {
            const data = await getBooks();
            setBooks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading books:", error);
            alert(error.message || "โหลดรายการหนังสือไม่สำเร็จ");
        }
    };

    useEffect(() => {
        if (page === "books" && user) {
            loadBooks();
        }
    }, [page, user]);

    // =========================
    // REGISTER
    // =========================

    const handleRegister = async (newUser) => {
        try {
            const data = await registerUser(newUser);

            alert(data.message || "สมัครสมาชิกสำเร็จ");
            setPage("login");
        } catch (error) {
            console.error("Error registering:", error);
            alert(error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
        }
    };

    // =========================
    // LOGIN
    // =========================

    const handleLogin = async (loginData) => {
        try {
            const data = await loginUser(loginData);

            if (!data.user || !data.token) {
                alert(data.message || "Login ไม่สำเร็จ");
                return;
            }

            // เก็บ Token สำหรับเรียก API
            localStorage.setItem("token", data.token);

            // เก็บข้อมูลผู้ใช้ รวมถึง Role
            setUser(data.user);

            setSelectedBook(null);
            setPage("books");

            alert("Login สำเร็จ");
        } catch (error) {
            console.error("Error logging in:", error);
            alert(error.message || "เกิดข้อผิดพลาดในการ Login");
        }
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem("token");

        setUser(null);
        setBooks([]);
        setSelectedBook(null);
        setPage("login");
    };

    // =========================
    // SAVE BOOK
    // =========================

    const handleSave = async (book) => {
        // ป้องกันผู้ใช้ที่ไม่มีสิทธิ์
        if (!canEdit) {
            alert("คุณไม่มีสิทธิ์เพิ่มหรือแก้ไขหนังสือ");
            return;
        }

        try {
            if (selectedBook) {
                await updateBook(selectedBook.id, book);
                alert("แก้ไขหนังสือสำเร็จ");
            } else {
                await addBook(book);
                alert("เพิ่มหนังสือสำเร็จ");
            }

            setSelectedBook(null);
            await loadBooks();
        } catch (error) {
            console.error("Error saving book:", error);
            alert(error.message || "บันทึกหนังสือไม่สำเร็จ");
        }
    };

    // =========================
    // EDIT BOOK
    // =========================

    const handleEdit = (book) => {
        if (!canEdit) {
            alert("คุณไม่มีสิทธิ์แก้ไขหนังสือ");
            return;
        }

        setSelectedBook(book);
    };

    // =========================
    // DELETE BOOK
    // =========================

    const handleDelete = async (id) => {
        if (!canDelete) {
            alert("เฉพาะ Admin เท่านั้นที่สามารถลบหนังสือได้");
            return;
        }

        const confirmDelete = window.confirm(
            "ต้องการลบหนังสือเล่มนี้หรือไม่?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteBook(id);
            alert("ลบหนังสือสำเร็จ");
            await loadBooks();
        } catch (error) {
            console.error("Error deleting book:", error);
            alert(error.message || "ลบหนังสือไม่สำเร็จ");
        }
    };

    // =========================
    // CANCEL EDIT
    // =========================

    const handleCancel = () => {
        setSelectedBook(null);
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div>
            {/* NAVBAR */}
            <div className="navbar">
                <div className="navbar-logo">
                    📚 Book Management
                </div>

                <div className="navbar-menu">
                    {!user && (
                        <>
                            <button onClick={() => setPage("login")}>
                                Login
                            </button>

                            <button onClick={() => setPage("register")}>
                                Register
                            </button>
                        </>
                    )}

                    {user && (
                        <>
                            <span className="user-name">
                                👤 {user.name}
                            </span>

                            <span className="user-role">
                                Role: {role}
                            </span>

                            <button onClick={() => setPage("books")}>
                                Books
                            </button>

                            <button onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* LOGIN */}
            {page === "login" && !user && (
                <Login onLogin={handleLogin} />
            )}

            {/* REGISTER */}
            {page === "register" && !user && (
                <Register onRegister={handleRegister} />
            )}

            {/* BOOK MANAGEMENT */}
            {page === "books" && user && (
                <div className="container">
                    <h1 className="title">
                        📚 Book Management
                    </h1>

                    <div className="card">
                        <h3>ข้อมูลผู้ใช้</h3>

                        <p>
                            ชื่อผู้ใช้: {user.name}
                        </p>

                        <p>
                            Role: <strong>{role}</strong>
                        </p>

                        <p>
                            {role === "viewer" &&
                                "คุณสามารถดูรายการหนังสือได้เท่านั้น"}

                            {role === "editor" &&
                                "คุณสามารถดู เพิ่ม และแก้ไขหนังสือได้"}

                            {role === "admin" &&
                                "คุณสามารถจัดการหนังสือได้ทุกอย่าง"}
                        </p>
                    </div>

                    {/* แสดงฟอร์มเฉพาะ Editor และ Admin */}
                    {canEdit && (
                        <div className="card">
                            <h2>
                                {selectedBook
                                    ? "✏️ แก้ไขหนังสือ"
                                    : "➕ เพิ่มหนังสือ"}
                            </h2>

                            <BookForm
                                selectedBook={selectedBook}
                                onSave={handleSave}
                                onCancel={handleCancel}
                            />
                        </div>
                    )}

                    {/* รายการหนังสือทุก Role ดูได้ */}
                    <div className="card">
                        <h2>📖 รายการหนังสือ</h2>

                        <BookTable
                            books={books}
                            onEdit={canEdit ? handleEdit : undefined}
                            onDelete={canDelete ? handleDelete : undefined}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;