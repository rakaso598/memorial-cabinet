// src/components/MarkdownPreview.js
import React from 'react';
import { marked } from 'marked'; // marked 라이브러리 임포트

const MarkdownPreview = ({ content }) => {
  // content가 변경될 때마다 Markdown을 HTML로 변환
  // marked.parse를 사용하여 Markdown을 HTML 문자열로 변환합니다.
  const createMarkup = () => {
    return { __html: marked.parse(content || '') };
  };

  return (
    <div
      className="markdown-body p-4 w-full h-full overflow-y-auto" // globals.css의 markdown-body 클래스 사용
      dangerouslySetInnerHTML={createMarkup()} // 변환된 HTML을 삽입
    />
  );
};

export default MarkdownPreview;
