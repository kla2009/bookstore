import { useEffect, useState } from "react";

function BookForm({ selectedBook, onSave, onCancel }) {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        if (selectedBook) {
            setTitle(selectedBook.title);
            setAuthor(selectedBook.author);
            setPrice(selectedBook.price);
            setStock(selectedBook.stock);
            setCategory(selectedBook.category || "");
        } else {
            setTitle("");
            setAuthor("");
            setPrice("");
            setStock("");
            setCategory("");
        }
    }, [selectedBook]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const book = {
            title,
            author,
            price,
            stock,
            category,
        };

        onSave(book);
    };

    return (
        <div className="book-form">

            <div className="form-header">
                <div className="form-icon">
                    {selectedBook ? "✏️" : "📚"}
                </div>

                <div>
                    <h2>
                        {selectedBook ? "Edit Book" : "Add New Book"}
                    </h2>

                    <p>
                        {selectedBook
                            ? "Update your book information"
                            : "Add a new book to your collection"}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>

                <div className="form-grid">

                    <div className="form-group">
                        <label>Book Title</label>

                        <input
                            type="text"
                            placeholder="Enter book title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Author</label>

                        <input
                            type="text"
                            placeholder="Enter author name"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Price</label>

                        <div className="input-with-icon">
                            <span>฿</span>

                            <input
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Stock</label>

                        <input
                            type="number"
                            placeholder="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label>Category</label>

                        <input
                            type="text"
                            placeholder="e.g. Programming, Fiction, AI"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>

                </div>

                <div className="button-group">

                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        {selectedBook
                            ? "💾 Update Book"
                            : "➕ Add Book"}
                    </button>

                    {selectedBook && (
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    )}

                </div>

            </form>

        </div>
    );
}

export default BookForm;