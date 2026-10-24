import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import './Projects.css';

export default function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulateError, setSimulateError] = useState(false);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const [query, setQuery] = useState('');
  const githubUsername = import.meta.env.VITE_GITHUB_USERNAME || '24CS080-Varshil';
  const cacheKey = `github-repos:${githubUsername}`;

  const readCachedRepos = () => {
    try {
      const cachedValue = window.localStorage.getItem(cacheKey);
      return cachedValue ? JSON.parse(cachedValue) : [];
    } catch {
      return [];
    }
  };

  const saveCachedRepos = (nextRepos) => {
    try {
      window.localStorage.setItem(cacheKey, JSON.stringify(nextRepos));
    } catch {
      // Ignore storage failures and keep the live response only.
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    setRepos([]);

    const controller = new AbortController();
    const signal = controller.signal;
    const cachedRepos = readCachedRepos();

    const target = simulateError
      ? 'https://api.github.com/invalid_endpoint_for_testing'
      : `https://api.github.com/users/${githubUsername}/repos?per_page=10&sort=updated`;
    const token = import.meta.env.VITE_GH_TOKEN;
    const headers = simulateError ? {} : token ? { Authorization: `Bearer ${token}` } : {};

    fetch(target, { signal, headers })
      .then(async (res) => {
        if (!res.ok) {
          const responseText = await res.text().catch(() => '');
          throw new Error(
            responseText
              ? `Request failed with status ${res.status}: ${responseText}`
              : `Request failed with status ${res.status}`,
          );
        }
        return res.json();
      })
      .then((data) => {
        const nextRepos = Array.isArray(data) ? data : [];
        setRepos(nextRepos);
        saveCachedRepos(nextRepos);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'An unexpected error occurred.');
        setRepos([]);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [simulateError, refetchIndex, githubUsername]);

  if (loading && repos.length === 0) return <Spinner message="Fetching repositories..." />;

  const filtered = repos.filter(
    (r) => r.name && r.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const emptyMessage =
    repos.length === 0
      ? 'No repositories are available right now.'
      : 'No repositories match your search.';

  return (
    <section className="projects-section">
      <div className="header-row">
        <h2>Repositories</h2>
        <div className="controls">
          <input
            aria-label="Filter repositories"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button className="btn" onClick={() => setSimulateError((s) => !s)} type="button">
            {simulateError ? 'Use Valid API' : 'Simulate Error'}
          </button>
          <button className="btn" onClick={() => setRefetchIndex((n) => n + 1)} type="button">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => setRefetchIndex((n) => n + 1)}
          isSimulated={simulateError}
        />
      )}

      <ul className="repo-list">
        {filtered.length === 0 && <li className="repo-empty">{emptyMessage}</li>}
        {filtered.map((r) => (
          <li key={r.id} className="repo-item">
            <div className="repo-header">
              <span className="repo-name">{r.name}</span>
              <span className="repo-stars">★ {r.stargazers_count ?? 0}</span>
            </div>
            <a href={r.html_url} target="_blank" rel="noreferrer" className="repo-url">
              {r.html_url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
