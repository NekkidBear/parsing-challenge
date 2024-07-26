import React, { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';

const HTMLParser: React.FC = () => {
  const [url, setUrl] = useState(''); // State to hold the URL input by the user
  const [inputHtml, setInputHtml] = useState(''); // State to hold the fetched or pasted HTML content
  const [sanitizedHtml, setSanitizedHtml] = useState(''); // State to hold the sanitized HTML content
  const [loading, setLoading] = useState(false); // State to indicate loading status
  const [error, setError] = useState<string | null>(null); // State to hold any error messages

  // Function to fetch HTML content from the provided URL
  const fetchHtmlFromUrl = async () => {
    try {
      setLoading(true); // Indicate loading state
      setError(null); // Clear any previous errors
      const response = await axios.get(url); // Fetch HTML content from the provided URL
      const sanitizedHtml = DOMPurify.sanitize(response.data); // Sanitize the fetched HTML content
      setInputHtml(response.data); // Set the fetched HTML content to state
      setSanitizedHtml(sanitizedHtml); // Set the sanitized HTML content to state
    } catch (error) {
      console.error('Error fetching HTML:', error); // Log the error for debugging
      setError('Failed to fetch HTML content. Please check the URL and try again.'); // Set user-friendly error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!'); // Notify user of successful copy
    }, (err) => {
      console.error('Could not copy text: ', err); // Log the error if copy fails
    });
  };

  // Function to handle pasted HTML content
  const handlePastedHtml = (html: string) => {
    const sanitizedHtml = DOMPurify.sanitize(html); // Sanitize the pasted HTML content
    setSanitizedHtml(sanitizedHtml); // Set the sanitized HTML content to state
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)} // Update URL state on input change
          placeholder="Enter URL"
        />
        <button onClick={fetchHtmlFromUrl} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch HTML'} {/* Button to fetch HTML content */}
        </button>
      </div>
      {error && <p className="error">{error}</p>} {/* Display error message if any */}
      <div>
        <textarea
          value={inputHtml}
          onChange={(e) => {
            setInputHtml(e.target.value);
            handlePastedHtml(e.target.value);
          }} // Update HTML content state on input change
          placeholder="Or paste HTML here"
        />
      </div>
      <div>
        <button onClick={() => copyToClipboard(inputHtml)}>
          Copy HTML to Clipboard {/* Button to copy HTML content to clipboard */}
        </button>
      </div>
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> {/* Render the sanitized HTML content */}
    </div>
  );
};

export default HTMLParser;
