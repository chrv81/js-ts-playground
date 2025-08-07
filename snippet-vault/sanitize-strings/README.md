# Sanitize Strings
Some HTML tags can be dangerous. For example, `<script>` can run code that does bad things.

By only allowing safe tags, we stop people from sneaking in bad stuff.

## OPTION 1

The `sanitizeHTML` function uses these regexes to remove all disallowed HTML tags and `onClick` attributes from the input string.

### `tagRegex`

It looks for any tag that is not in our allowed list. If it finds a tag like `<span>` or `<script>`, it removes it.
If it finds `<b>`, `<i>`, `<nobr>`, or `<br>`, it keeps it

```ts
const tagRegex = new RegExp(
    `</?(?!(${allowedTags.join('|')}))\\b[^>]*>`,
    'g'
  );
```

- `</?` : Matches the start of an HTML tag.
    - `<` : the start of an HTML tag
    - `/?` : the slash `/` is optional
        - If there is no slash, it matches an opening tag like `<b>`.
        - If there is a slash, it matches a closing tag like `</b>`.
        
    - example:
        ```ts
        '<b>Bold</b> <i>Italic</i>'
        ```
        result:
        ```ts
        // ["<", "</", "<", "</"]
        ```

- `(?! ... )` : negative lookahead - ensures the tag name is not in the "allowed tags" list. checks the tag name after < or </ and says, "If it’s not allowed, match it."
    - `()` : capture group
    - `?!` : (negative lookahead) Looks ahead to make sure what’s next does not match the pattern inside and it does not consume characters, just checks
        - opposite of it is `?=` (positive look ahead)

- `(${allowedTags.join('|')})` : creates a regex pattern that matches any of the allowed tag names
    - turns `['b', 'i', 'nobr', 'br']` into `"b|i|nobr|br"`

    - example:
        ```ts
        '<b>Bold</b> <span>Span</span> <nobr>No break</nobr>'
        ```
        result:
        ```ts
        // ["<span>", "</span>"]
        ```

- `\\b` : word boundary - makes sure match whole words only.
    - `<nobr>` is allowed (matches exactly).
    - `<nobreak>` is not allowed (doesn’t match exactly).
        - example:
        ```ts
        '<nobr>Allowed</nobr> <nobreak>Not allowed</nobreak>'
        ```
        result:
        ```ts
        // ["nobr", "nobr"]
        ```

- `[^>]*>`: Matches any characters that aren't `>`, followed by `>`. This is used to match the rest of the tag, whether it's an opening tag or a closing tag.
    - `[^>]` : any character except `>`.
    - `*` : zero or more times
    - `[^>]*` matches everything inside the tag until it finds a `>`
    - The final `>` matches the end of the tag

    - example:
        ```ts
        '<span class="red" id="mySpan">'
        ```
        result:
        ```ts
        // span class="red" id="mySpan">
        ```


### `onClickRegex`

This regex is used to match `onClick` attributes in HTML tags.

```ts
const onClickRegex = / onClick=(["'])[^"']+\1/gi;
```

- ` onClick=` : it looks for the exact text  onClick= (with a space before it), so it only matches exactly the attribute in a tag, not part of another attribute or text.
    - example : 
        ```ts
        '<b onClick="alert(1)">Click</b>'
        ```
        result:
        ```ts
        // [" onClick="]
        ```

- `(["'])`: Matches either a single quote `'` or a double quote `"`, and it remembers which one was used
    - example : 
        ```ts
        '<b onClick="alert(1)">'
        ```
        result:
        ```ts
        // ['"']
        ```
    - example : 
        ```ts
        '<b onClick='alert(1)'>'
        ```
        result:
        ```ts
        // ["'"]
        ```

- `[^"']+`: Matches one or more characters that are NOT a quote.
This grabs the value inside the quotes
    - example : 
        ```ts
        'onClick="alert(1)"'
        ```
        result:
        ```ts
        // ["onClick="]
        ```
    - example : 
        ```ts
        '"alert(1)"'
        ```
        result:
        ```ts
        // ["alert(1)"]
        ```

- `\1`: Matches the same quote that was used at the start (`"` or `'`).
Makes sure the value is closed with the same type of quote
    - example : 
        ```html
        onClick="alert(1)"
        ```
        result:
        ```ts
        // ['"alert(1)"']
        ```
    - example : 
        ```ts
        onClick='hello'
        ```
        result:
        ```ts
        // ["'hello'"]
        ```

- `/gi` : match all and case-insensitive
    - `g` = global (find all matches, not just the first)
    - `i` = case-insensitive (matches `onClick`, `ONCLICK`, etc.)


---

## OPTION 2

### `tagBody`
Used to match the inside of an HTML tag, including any attributes and quoted values

- `(?: ... )` : This is a non-capturing group. It groups things together but doesn’t save the match for later.
    - `()` : capture group
    - `?:` : Groups things together, but does not remember (does not create a capture group)

- `[^"\'>]` : any character except `"`, `'`, `>`, it matches normal characters inside a tag that are not quotes or closing angle bracket
    - example:
        ```ts
        '<span class=red>'
        ```
        result:
        ```ts
        // ["s", "p", "a", "n", " ", "c", "l", "a", "s", "s", "=", "r", "e", "d"]
        ```

- `"[^"]*"` : This matches a whole double-quoted string.
    - `"` matches a double quote.
    - `[^"]*` matches any number of characters that are not a double quote.
    - `"` matches the closing double quote.

    - example:
        ```ts
        '<span class="red">'
        ```
        result
        ```ts
        // ['"red"']
        ```

- `'[^\']*'` : This matches a whole single-quoted string.
    - `'` matches a single quote.
    - `[^\']*` matches any number of characters that are not a single quote.
    - `'` matches the closing single quote.
    - example:
        ```ts
        "<span class='blue'>"
        ```
        result
        ```ts
        // ["'blue'"]
        ```

- `*` (at the end) : repeat the group zero or more times. It matches any mix of normal characters, double-quoted, or single-quoted strings inside a tag.

### `tagOrComment`

...

## OPTION 3 - Using DOMPurify

DOMPurify is a robust and secure way to sanitize HTML. It allows you to specify which tags and attributes should be allowed.

First, install DOMPurify using npm:

```bash
npm install dompurify
```

or using CDN from [jsdelivr](https://www.jsdelivr.com/package/npm/dompurify) package (popular public CDN for npm packages). Check out their CDN install page for dompurify: https://www.jsdelivr.com/package/npm/dompurify

```html
<!-- Add this in your HTML <head> or before your script -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js"></script>

```

Then, implement them in code such as OPTION 1:

```tsx
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => {
  // Specify the tags you want to allow
  const allowedTags = ['b', 'i', 'nobr', 'br'];

  // Specify the attributes you want to allow
  const allowedAttributes = ['class', 'id'];

  // Configure DOMPurify
  const cleanHTML = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  });

  return cleanHTML;
}
```

In this example, `sanitizeHTML` is a function that takes a string of HTML, sanitizes it with DOMPurify, and returns the sanitized HTML. The `ALLOWED_TAGS` and `ALLOWED_ATTR` options are used to specify which tags and attributes should be allowed.

Please note that DOMPurify works in a browser environment and needs a DOM to work. 

## OPTION 4 - using `JSDOM`

If using it in a server-side environment like Node.js, then need to use it with a library like JSDOM to provide a DOM.

To install JSDOM with npm:
```bash
npm install jsdom

```

or CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/jsdom@26.1.0/lib/api.min.js"></script>
```

Read more here: [https://www.jsdelivr.com/package/npm/jsdom](https://www.jsdelivr.com/package/npm/jsdom)

Common use of `jsdom` is scraping and extracting data from an external HTML page:

```ts
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';

// Fetch HTML and extract all links
const extractLinks = async (url: string): Promise<string[]> => {
  const response = await fetch(url);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Extract all href attributes from <a> tags
  const links = Array.from(document.querySelectorAll('a'))
    .map(a => a.href)
    .filter(href => !!href);

  return links;
};

// Usage example
extractLinks('https://example.com').then(links => {
  console.log('Links found:', links);
});
```

## OPTION 5 - using `js-xss`

`js-xss` is a powerful library for sanitizing HTML to prevent XSS attacks. It provides a flexible configuration to specify which HTML tags and attributes are allowed.

First, install js-xss.

Using npm:

```tsx
npm install xss
```

or with CDN

```html
<script src="https://cdn.jsdelivr.net/npm/xss/dist/xss.min.js"></script>
```

Then, you can use it in your code like this:

Client side:
```tsx
import xss from 'xss';

const sanitizeHTML = (html: string) => {
  // Specify the tags you want to allow
  const allowedTags = ['b', 'i', 'nobr', 'br'];

  // Specify the attributes you want to allow
  const allowedAttributes = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'title'],
    'div': ['class'],
    // Add more tags/attributes if you need
  };

  // Configure js-xss
  const options = {
    whiteList: {
      ...xss.getDefaultWhiteList(), // Use the default whitelist
      ...allowedTags.reduce((obj, tag) => ({ ...obj, [tag]: allowedAttributes[tag] || [] }), {}), // Add your tags to the whitelist
    },
    stripIgnoreTag: true, // Strip all tags that are not in the whitelist
    stripIgnoreTagBody: ['script'] // Strip the body of ignored tags
  };

  const cleanHTML = xss(html, options);

  return cleanHTML;
}
```

In this example, `sanitizeHTML` is a function that takes a string of HTML, sanitizes it with js-xss, and returns the sanitized HTML. The `whiteList` option is used to specify which tags and attributes should be allowed. The `stripIgnoreTag` and `stripIgnoreTagBody` options are used to remove all tags and tag bodies that are not in the whitelist.

or another clint side example
```html
<script src="https://cdn.jsdelivr.net/npm/xss/dist/xss.min.js"></script>
<script>
  // string contains an <img> tag with an onerror attribute, which could trigger XSS
  const dirty = '<img src="x" onerror="alert(1)">Hi!';

  // function (provided globally by the library) sanitizes the input, removing dangerous attributes like onerror
  const clean = filterXSS(dirty);
  document.body.innerHTML = clean; // Safe to insert
</script>
```

or server-side
```js
import xss from 'xss';

// containing potentially unsafe HTML (with a <script> tag)
const dirty = '<script>alert("xss")</script><b>Hello</b>';
const clean = xss(dirty);

console.log(clean); // Output: &lt;script&gt;alert("xss")&lt;/script&gt;<b>Hello</b>
```



