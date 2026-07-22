import { hasVisibleReportContent, richHtmlToReportMarkup } from '@/lib/reportRichText';

it('preserves independently formatted ranges without storing HTML', () => {
  expect(
    richHtmlToReportMarkup(
      '<div><b>Hello</b> <u>there</u> <i>friend</i> <strike>old</strike></div>',
    ),
  ).toBe('**Hello** <u>there</u> _friend_ ~~old~~');
});

it('preserves alignment and list semantics', () => {
  expect(
    richHtmlToReportMarkup(
      '<div style="text-align: right;"><b>Right</b></div><ol><li>First</li><li>Second</li></ol><ul style="list-style-type: circle;"><li>Circle</li></ul>',
    ),
  ).toBe('<right>**Right**</right>\n1. First\n2. Second\n○ Circle');
});

it('detects visually empty rich-editor output', () => {
  expect(hasVisibleReportContent('<div><br></div>')).toBe(false);
  expect(hasVisibleReportContent('<div>&nbsp;Note&nbsp;</div>')).toBe(true);
});
