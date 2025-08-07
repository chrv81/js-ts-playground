/**
 * OPTION 1
 * This is a simple HTML sanitizer that removes all tags except for a few allowed ones.
 * It also removes any onClick attributes to prevent XSS attacks.
 */

const sanitizeHTML = (html: string) => {
  const allowedTags = ['b', 'i', 'nobr', 'br'];
  const tagRegex = new RegExp(
    `</?(?!(${allowedTags.join('|')}))\\b[^>]*>`,
    'g'
  );
  const onClickRegex = / onClick=(["'])[^"']+\1/gi;
  return html.replace(tagRegex, '').replace(onClickRegex, '');
};

const createMarkup = (html: string) => {
  return { __html: sanitizeHTML(html) };
};

// example usage in a React component
// export default const Component = (props: ComponentProps) => (
//   <p className="text-caption text-xs" dangerouslySetInnerHTML={createMarkup(`${props.text}`)} />
// )

/**
 * OPTION 2
 * This is a more comprehensive HTML sanitizer that removes all tags and comments,
 * including script and style tags, to prevent XSS attacks.
 * It also replaces any remaining angle brackets with their HTML entities.
 * This is useful for sanitizing user input or any HTML content that may contain unsafe tags.
 */

const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

const tagOrComment = new RegExp(
  '<(?:' +
    // Comment body.
    '!--(?:(?:-*[^->])*--+|-?)' +
    // Special "raw text" elements whose content should be elided.
    '|script\\b' +
    tagBody +
    '>[\\s\\S]*?</script\\s*' +
    '|style\\b' +
    tagBody +
    '>[\\s\\S]*?</style\\s*' +
    // Regular name
    '|/?[a-z]' +
    tagBody +
    ')>',
  'gi'
);

const removeTags = (html: string) => {
  let oldHtml;
  do {
    oldHtml = html;
    html = html.replace(tagOrComment, '');
  } while (html !== oldHtml);
  return html.replace(/</g, '&lt;');
};
