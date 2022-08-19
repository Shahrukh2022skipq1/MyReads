import "./App.css";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Shelves from "./components/shelves";
import * as BooksAPI from "./BooksAPI"
import Book from "./components/book"
import { BrowserRouter, Routes, Route, Link } from "react-router-dom"

function App() {
  const [books, setbooks] = useState([])
  const [query, setqeury] = useState("")
  const [searchBooks, setSearchBooks] = useState([])
  const [mergebooks, setmergebooks] = useState([])
  const [mapOfIdToBooks, setmapOfIdToBooks] = useState(new Map());



  useEffect(() => {
    BooksAPI.getAll().then(data => {
      setbooks(data);
      setmapOfIdToBooks(createMapOfBooks(data))
    }

    )
  }, [])



  useEffect(() => {
    let isActive = true
    if (query) {
      BooksAPI.search(query).then(data => {
        if (data.error) {
          console.log(data)
        } else {
          if (isActive) {
            setSearchBooks(data)
          }
        }
      })
    }
    return () => {
      isActive = false;
      setSearchBooks([])
    }
  }, [query])




  useEffect(() => {
    const combinedbooks = searchBooks.map(book => {
      if (mapOfIdToBooks.has(book.id)) {
        return mapOfIdToBooks.get(book.id)
      }
      else {
        return book
      }
    })
    setmergebooks(combinedbooks)
  }, [searchBooks])




  const createMapOfBooks = (books) => {
    const map = new Map()
    books.map(book => map.set(book.id, book))
    return map

  }



  const updateBookShelf = (book, whereTo) => {
    const updatedbooks = books.map((b) => {
      if (b.id === book.id) {
        book.shelf = whereTo;
        return book
      }
      return b
    })
    if (!mapOfIdToBooks.has(book.id)) {
      book.shelf = whereTo
      updatedbooks.push(book)
    }
    setbooks(updatedbooks)
    BooksAPI.update(book, whereTo)
  }




  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/search" element={
            <div className="search-books">
              <div className="search-books-bar">
                <Link to="/"><a className="close-search">Close</a></Link>
                <div className="search-books-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search by title, author, or ISBN"
                    value={query}
                    onChange={(e) => setqeury(e.target.value)}
                  />
                </div>
              </div>
              <div className="search-books-results">
                <ol className="books-grid">
                  {mergebooks.map(b => (
                    <li key={b.id}>
                      <Book book={b} changeBookShelf={updateBookShelf} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          }>

          </Route>

          <Route path="/" element={<div className="list-books">
            <Header />
            <div className="list-books-content">
              <Shelves books={books} updateBookShelf={updateBookShelf} />
            </div>
            <div className="open-search">
              <Link to="/search"> <a >Add a book</a></Link>
            </div>
          </div>}>

          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
