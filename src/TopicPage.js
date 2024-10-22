import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// human-readable time since secret was created
const timeAgo = (date) => {
  const now = new Date();
  const timeDifference = now - new Date(date);
  const minutesAgo = Math.floor(timeDifference / 60000);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo > 0) {
    return daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`;
  } else if (hoursAgo > 0) {
    return hoursAgo === 1 ? '1 hour ago' : `${hoursAgo} hours ago`;
  } else if (minutesAgo > 0) {
    return minutesAgo === 1 ? '1 minute ago' : `${minutesAgo} minutes ago`;
  } else {
    return 'Just now';
  }
};

const TopicPage = () => {
  const { topicId } = useParams();
  const [secrets, setSecrets] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [secretsMap, setSecretsMap] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [topicName, setTopicName] = useState('');
  const [error, setError] = useState(null); // Add error state
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const fetchSecrets = async (pageNumber, showPolling = true) => {
    setLoading(showPolling);
    setError(null); // Reset error state before fetching
    try {
      const response = await axios.get(
        `${baseUrl}/api/secrets/topic/${topicId}?page=${pageNumber}&page_size=${pageSize}`
      );
      const secretsData = response.data.secrets;

      // Set the topic name from the response
      setTopicName(response.data.topic_name);

      const secretsWithDetails = await Promise.all(
        secretsData.map(async (secret) => {
          if (secretsMap[secret.store_id]) {
            return {
              ...secret,
              actual_secret: secretsMap[secret.store_id].secret,
            };
          }

          const secretResponse = await axios.get(
            `${baseUrl}/api/secret/retrieve/${secret.store_id}?secret_name=${secret.secret_name}`
          );
          setSecretsMap((prev) => ({
            ...prev,
            [secret.store_id]: { ...secret, ...secretResponse.data },
          }));
          return { ...secret, actual_secret: secretResponse.data.secret };
        })
      );

      setSecrets(secretsWithDetails);
      setTotalCount(response.data.total_count);
    } catch (error) {
      console.error('Error fetching secrets:', error);
      setError('No tea spilled here yet. Check back later');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSecrets(page);
    const intervalId = setInterval(() => {
      fetchSecrets(page, false); // don't show polling if we're interval polling to get new secrets
    }, 30000);

    return () => clearInterval(intervalId);
  }, [page, topicId]);

  return (
    <div className="container">
      {error ? ( // Conditional rendering based on error state
        <p>{error}</p>
      ) : (
        <>
          <h1>
            #{topicName} {totalCount > 0 ? `(${totalCount})` : ''}
          </h1>
          {initialLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              {loading ? (
                <p>Loading secrets...</p>
              ) : (
                <ul className="topic-list">
                  {secrets.map((secret) => (
                    <li key={secret.id} className="topic-item">
                      <h2>{secretsMap[secret.store_id]?.secret}</h2>{' '}
                      <p>
                        Stored in Nillion{' '}
                        {timeAgo(secretsMap[secret.store_id]?.created_at)} by
                        anon{' '}
                        {secretsMap[
                          secret.store_id
                        ]?.nillion_user_id?.substring(0, 6)}
                        ...
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {totalCount >= pageSize && ( // Only render buttons if totalCount is greater than or equal to pageSize
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={secrets.length < pageSize}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TopicPage;
