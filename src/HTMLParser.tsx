import React, { useState } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';

// Define the structure of a parsed item
interface ParsedItem {
  content: string;
  children: ParsedItem[];
}

const HTMLParser: React.FC = () => {
  const [url, setUrl] = useState(''); // State to hold the URL input by the user
  const [inputHtml, setInputHtml] = useState(''); // State to hold the fetched HTML content
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]); // State to hold the parsed items
  const [loading, setLoading] = useState(false); // State to indicate loading status
  const [error, setError] = useState<string | null>(null); // State to hold any error messages

  // Function to fetch HTML content from the provided URL
  const fetchHtmlFromUrl = async () => {
    try {
      setLoading(true); // Indicate loading state
      setError(null); // Clear any previous errors
      const response = await axios.get(url); // Fetch HTML content from the provided URL
      const sanitizedHtml = DOMPurify.sanitize(response.data); // Sanitize the fetched HTML content
      setInputHtml(sanitizedHtml); // Set the sanitized HTML content to state
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

  // Function to parse HTML content and update parsedItems state
  const parseHtmlContent = () => {
    // Example parsing logic (you need to implement your own parsing logic)
    const parsed = [
      {
        content: inputHtml,
        children: []
      }
    ];
    setParsedItems(parsed);
  };

  // Function to recursively render parsed content
  const renderParsedContent = (items: ParsedItem[], level: number = 0): JSX.Element[] => {
    return items.map((item, index) => {
      const indentClass = `indent-${level}`; // Class for indentation based on hierarchy level
      const paragraphHierarchy = item.content.match(/^\((\w+)\)/); // Match paragraph hierarchy pattern
      const paragraphHeading = item.content.match(/<em>(.*?)<\/em>/); // Match paragraph heading pattern

      return (
        <div key={index} id={`p-${item.content}`} className="parsed-item">
          <p className={`${indentClass} parsed-paragraph`} data-title={item.content}>
            {paragraphHierarchy && (
              <span className="paragraph-hierarchy">
                <span className="paren">({paragraphHierarchy[1]})</span> {/* Render paragraph hierarchy */}
              </span>
            )}
            {paragraphHeading && (
              <em className="paragraph-heading">{paragraphHeading[1]}</em>
            )}
            {item.content} {/* Render the content */}
          </p>
          {renderParsedContent(item.children, level + 1)}
        </div>
      );
    });
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
          onChange={(e) => setInputHtml(e.target.value)} // Update HTML content state on input change
          placeholder="Or paste HTML here"
        />
      </div>
      <div>
        <button onClick={() => copyToClipboard(inputHtml)}>
          Copy HTML to Clipboard {/* Button to copy HTML content to clipboard */}
        </button>
        <button onClick={parseHtmlContent}>
          Go {/* Button to parse and render HTML content */}
        </button>
      </div>
      <div>
        {renderParsedContent(parsedItems)} {/* Render the parsed content */}
      </div>
    </div>
  );
};

export default HTMLParser;