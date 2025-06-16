import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import "./App.css";

function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    axios.get('/api/jokes')
    .then((response) => {
      setJokes(response.data);
    })
    .catch((error) => {
      console.error("Error fetching jokes:", error);
    });
  }, []);

  return (
    <>
      <h1>Joke App || Practice</h1>
      <p>Jokes: {jokes.length}</p>

      {
        jokes.map((joke) => {
          return (
            <div key={joke.id}>
              <h3>{joke.joke}</h3>
            </div>
          )
        })
      }
    </>
  )
}

export default App
