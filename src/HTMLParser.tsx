import React, { useState, useEffect } from 'react';
import * as cheerio from 'cheerio';
import axios from 'axios';

interface ParsedItem {
  level: number;
  content: string;
  children: ParsedItem[];
}

const HtmlParser: React.FunctionComponent = () => {
  const [inputHtml, setInputHtml] = useState<string>('');
  const [parsedContent, setParsedContent] = useState<ParsedItem[]>([]);
  const [url, setUrl] = useState<string>('');

  // Function to parse HTML string into a structured format
  const parseHtml = (html: string): ParsedItem[] => {
    const $ = cheerio.load(html);
    const items: ParsedItem[] = [];

    // Recursive function to process each node and its children
    const processNode = (element: cheerio.Element, level: number): ParsedItem => {
      const $element = $(element);
      const item: ParsedItem = {
        level,
        content: $element.clone().children().remove().end().text().trim(),
        children: [],
      };

      // Process children nodes if they are 'p', 'div', or 'span'
      $element.children().each((_, child) => {
        if (['p', 'div', 'span'].includes(child.tagName.toLowerCase())) {
          item.children.push(processNode(child, level + 1));
        }
      });

      return item;
    };

    // Process top-level nodes in the body
    $('body').children().each((_, element) => {
      if (['p', 'div', 'span'].includes(element.tagName.toLowerCase())) {
        items.push(processNode(element, 0));
      }
    });

    return items;
  };

  // Effect to re-parse HTML whenever inputHtml changes
  useEffect(() => {
    if (inputHtml) {
      const parsed = parseHtml(inputHtml);
      setParsedContent(parsed);
    }
  }, [inputHtml]);

  // Function to fetch HTML content from a given URL
  const fetchHtmlFromUrl = async () => {
    try {
      const response = await axios.get(url);
      setInputHtml(response.data);
    } catch (error) {
      console.error('Error fetching HTML:', error);
      // Troubleshooting: Check if the URL is correct and the server is responding
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      // Troubleshooting: Ensure the browser supports clipboard API and permissions are granted
    });
  };

  // Function to render parsed content recursively
  const renderParsedContent = (items: ParsedItem[], level: number = 0): JSX.Element[] => {
    return items.map((item, index) => (
      <div key={index} style={{ marginLeft: level * 20 }}>
        <p>{item.content}</p>
        {renderParsedContent(item.children, level + 1)}
      </div>
    ));
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
      <div>{renderParsedContent(parsedContent)}</div>
    </div>
  );
};

export default HtmlParser;