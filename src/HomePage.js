import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
  const [topics, setTopics] = useState([]);
  console.log(process.env.REACT_APP_API_BASE_URL);
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchTopics = async () => {
    // try {
    //   const response = await axios.get(`${baseUrl}/api/topics`);
    //   setTopics([{ id: 9, name: 'demo' }]);
    // } catch (error) {
    //   console.error('Error fetching topics:', error);
    // }
    setTopics([{ id: 9, name: 'demo' }]);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <div className="container">
      <h1>🍵 Topics</h1>
      <ul className="topic-list">
        {topics.map((topic) => (
          <li key={topic.id} className="topic-item">
            <Link to={`/topic/${topic.id}`} className="topic-link">
              {topic.name}
            </Link>{' '}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
