import React, { useState, useEffect } from 'react';
import * as cheerio from 'cheerio';
import axios from 'axios';
import './App.css';

interface ParsedItem {
  level: number;
  content: string;
  children: ParsedItem[];
}

const HtmlParser: React.FunctionComponent = () => {
  const [inputHtml, setInputHtml] = useState<string>('');
  const [parsedContent, setParsedContent] = useState<ParsedItem[]>([]);
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const parseHtml = (html: string): ParsedItem[] => {
    const $ = cheerio.load(html);
    const items: ParsedItem[] = [];

    const processNode = (element: cheerio.Element, level: number): ParsedItem => {
      const $element = $(element);
      const item: ParsedItem = {
        level,
        content: $element.clone().children().remove().end().text().trim(),
        children: [],
      };

      $element.children().each((_, child) => {
        if (['p', 'div', 'span', 'h1'].includes(child.tagName.toLowerCase())) {
          item.children.push(processNode(child, level + 1));
        }
      });

      return item;
    };

    $('body').children().each((_, element) => {
      if (['p', 'div', 'span', 'h1'].includes(element.tagName.toLowerCase())) {
        items.push(processNode(element, 0));
      }
    });

    return items;
  };

  useEffect(() => {
    if (inputHtml) {
      setLoading(true);
      const parsed = parseHtml(inputHtml);
      setParsedContent(parsed);
      setLoading(false);
    }
  }, [inputHtml]);

  const fetchHtmlFromUrl = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      const response = await axios.get(url);
      setInputHtml(response.data);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      setError('Failed to fetch HTML content. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const renderParsedContent = (items: ParsedItem[], level: number = 0): JSX.Element[] => {
    return items.map((item, index) => {
      const indentClass = `indent-${level}`;
      const paragraphHierarchy = item.content.match(/^\((\w+)\)/);
      const paragraphHeading = item.content.match(/<em>(.*?)<\/em>/);

      return (
        <div key={index} id={`p-${item.content}`} className="parsed-item">
          <p className={`${indentClass} parsed-paragraph`} data-title={item.content}>
            {paragraphHierarchy && (
              <span className="paragraph-hierarchy">
                <span className="paren">({paragraphHierarchy[1]})</span>
              </span>
            )}
            {paragraphHeading && (
              <em className="paragraph-heading">{paragraphHeading[1]}</em>
            )}
            {item.content}
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
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL here"
        />
        <button onClick={fetchHtmlFromUrl}>Fetch and Parse</button>
      </div>
      <textarea
        value={inputHtml}
        onChange={(e) => setInputHtml(e.target.value)}
        placeholder="Enter HTML here"
      />
      <button onClick={() => copyToClipboard(inputHtml)}>Copy HTML</button>
      {loading ? <div className="spinner"></div> : <div>{renderParsedContent(parsedContent)}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default HtmlParser;