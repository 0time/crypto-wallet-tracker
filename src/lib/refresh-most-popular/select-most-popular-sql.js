module.exports = `
SELECT
  symbol,
  tCount
FROM
  (
    SELECT
      c.symbol symbol,
      COUNT(*) tCount
    FROM
      values v
    LEFT JOIN
      coins c
    ON
      v."idCoin" = c.id
    GROUP BY
      c.symbol
  ) t
ORDER BY t.tCount DESC
LIMIT 100
;`;
