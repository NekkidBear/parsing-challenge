import React, { useState, useEffect } from 'react';
import cheerio from 'cheerio';

// Define the structure for parsed items
// TODO: Consider adding more properties like 'type' for different formatting (e.g., numbered, bulleted)
interface ParsedItem {
  level: number;
  content: string;
  children: ParsedItem[];
}

const HtmlParser: React.FC = (): React.ReactNode => {
  // State for storing input HTML and parsed content
  const [inputHtml, setInputHtml] = useState<string>('');
  const [parsedContent, setParsedContent] = useState<ParsedItem[]>([]);

  // Main parsing function
  // NOTE: This function assumes a well-structured HTML input. It may need additional error handling for malformed HTML.
  const parseHtml = (html: string): ParsedItem[] => {
    // Load HTML into Cheerio
    const $ = cheerio.load(html);
    const items: ParsedItem[] = [];

    // Recursive function to process each node
    // MAINTENANCE: If new HTML elements need to be supported, add them to the tag check below
    const processNode = (element: cheerio.Element, level: number): ParsedItem => {
      const $element = $(element);
      const item: ParsedItem = {
        level,
        // Extract text content, removing child element text
        // TROUBLESHOOTING: If content appears duplicated, check this line
        content: $element.clone().children().remove().end().text().trim(),
        children: [],
      };

      // Process child elements
      $element.children().each((_, child) => {
        if (['p', 'div', 'span'].includes(child.tagName.toLowerCase())) {
          item.children.push(processNode(child, level + 1));
        }
      });

      return item;
    };

    // Start processing from body's immediate children
    // TODO: Consider adding support for parsing specific sections of the HTML
    $('body').children().each((_, element) => {
      if (['p', 'div', 'span'].includes(element.tagName.toLowerCase())) {
        items.push(processNode(element, 0));
      }
    });

    return items;
  };

  // Effect to trigger parsing when input HTML changes
  useEffect(() => {
    if (inputHtml) {
      const parsed = parseHtml(inputHtml);
      setParsedContent(parsed);
    }
  }, [inputHtml]);

  // Recursive function to render parsed content
  // MAINTENANCE: Modify this function to change the output format
  const renderParsedContent = (items: ParsedItem[], level: number = 0): JSX.Element[] => {
    return items.map((item, index) => (
      <div key={index} className={`indent-${level}`}>
        {/* TODO: Implement different formatting based on level or content type */}
        <p>{item.content}</p>
        {item.children.length > 0 && renderParsedContent(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">HTML Parser with Hierarchical Formatting</h1>
      {/* Input textarea for HTML */}
      {/* TROUBLESHOOTING: If input doesn't update, check onChange handler */}
      <textarea
        className="w-full h-40 p-2 border rounded"
        value={inputHtml}
        onChange={(e) => setInputHtml(e.target.value)}
        placeholder="Paste your HTML here..."
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Parsed Content:</h2>
        {/* Container for rendered parsed content */}
        {/* TODO: Add error boundary to handle rendering errors */}
        <div className="border p-4 rounded">
          {renderParsedContent(parsedContent)}
        </div>
      </div>
    </div>
  );
};

export default HtmlParser;