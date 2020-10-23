const { get, isNumber } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_APP },
} = require('../constants');

/*
const defaultSize2 = 16;
const defaultSize1 = 0x10000 / size2;
*/

const defaultCols = 16;
const defaultCount = 512;
const defaultPage = 1;

module.exports = (context) => {
  const app = get(context, RUNTIME_APP);

  app.get('/utf8', (req, res) => {
    const qsCount = get(req, 'query.count', defaultCount);
    const queryCount = parseInt(qsCount);
    const count =
      !isNumber(queryCount) || queryCount > defaultCount || queryCount <= 0
        ? defaultCount
        : queryCount;
    const maxPage = 0x10000 / count;
    const qsPage = get(req, 'query.page', defaultPage);
    const queryPage = parseInt(qsPage);
    const page =
      !isNumber(queryPage) || queryPage < 1 || queryPage > maxPage
        ? defaultPage
        : queryPage;
    const qsCols = get(req, 'query.cols', defaultCols);
    const queryCols = parseInt(qsCols);
    const cols =
      !isNumber(qsCols) || queryCols < 1 || queryCols > 32
        ? defaultCols
        : queryCols;
    const qsRows = get(req, 'query.rows', '0');
    const queryRows = parseInt(qsRows);

    const nextPage = page + 1;
    const prevPage = page - 1;

    const offset = page * count;
    const rows = queryRows > 0 ? queryRows : Math.floor(count / cols);

    const header = [
      `<HEAD>`,
      `<link rel="stylesheet" type="text/css" href="bootstrap.min.css">`,
      `<link rel="stylesheet" type="text/css" href="index.css">`,
      `</HEAD>`,
    ].join('');

    const navBarBuilder = [`<div class="controls navigation navigation-bar">`];

    navBarBuilder.push(
      `<a type="submit" class="${
        prevPage >= 1 || 'disabled'
      } prev-page-link" href="?page=${prevPage}&cols=${cols}&rows=${rows}">prev</a>`,
    );

    navBarBuilder.push(
      `<a type="submit" class="${
        nextPage <= maxPage || 'disabled'
      } next-page-link" href="?page=${nextPage}&cols=${cols}&rows=${rows}">next</a>`,
    );

    const offsetToPage = (offset) => Math.floor(offset / (rows * cols));

    [1, 10, 14, 16, 80, 125]
      .map((ea) => ea * 160)
      .map(offsetToPage)
      .forEach((page) =>
        navBarBuilder.push(
          `<a type="submit" class="absolute-page-link" href="?page=${page}&cols=${cols}&rows=${rows}">${page}</a>`,
        ),
      );

    navBarBuilder.push(`</div>`);

    const navBar = navBarBuilder.join('');

    const tbodyContents = [
      `<script>0</script>`,
      `<TR class="utf8-row">`,
      new Array(rows)
        .fill(0)
        .map((_, i) =>
          new Array(cols)
            .fill(0)
            .map(
              (_2, j) =>
                `<td class="utf8-symbol"><div class="ttip">${String.fromCharCode(
                  offset + i * cols + j,
                )}<span class="tooltiptext tooltip-top">\\u${
                  offset + i * cols + j
                }</span></div></td>`,
            )
            .join(''),
        )
        .join('</TR><TR class="utf8-row">'),
      `</TR>`,
    ].join('');

    const table = [
      `<TABLE>`,
      `<TBODY>`,
      tbodyContents,
      `</TBODY>`,
      `</TABLE>`,
    ].join('');

    return res
      .status(200)
      .send(
        [
          `<HTML>`,
          header,
          `<BODY>`,
          `<div id="container">`,
          navBar,
          table,
          `</div>`,
          `</BODY>`,
          `</HTML>`,
        ].join(''),
      );
  });

  return context;
};
