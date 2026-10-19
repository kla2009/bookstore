function BookTable({ books, onEdit, onDelete }) {
    return (
        <div>
            <h2>Book List</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>

                        {/* แสดง Action เฉพาะเมื่อมีสิทธิ์ */}
                        {(onEdit || onDelete) && (
                            <th>Action</th>
                        )}
                    </tr>
                </thead>

                <tbody>
                    {books.length > 0 ? (
                        books.map((book) => (
                            <tr key={book.id}>
                                <td>{book.id}</td>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.price}</td>
                                <td>{book.stock}</td>
                                <td>{book.category}</td>

                                {(onEdit || onDelete) && (
                                    <td>
                                        {/* Editor และ Admin */}
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(book)}
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {/* เฉพาะ Admin */}
                                        {onDelete && (
                                            <button
                                                onClick={() =>
                                                    onDelete(book.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={
                                    onEdit || onDelete ? 7 : 6
                                }
                                style={{ textAlign: "center" }}
                            >
                                No books found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default BookTable;