module.exports = `
SELECT
  c.symbol                            AS symbol,
  c.name                              AS name,
  v.price                             AS price,
  "quotesGetBaseHelper".maxTimestamp  AS timestamp
FROM
  (
    SELECT
      "idCoin",
      MAX(timestamp) maxTimestamp
    FROM
      values
    GROUP BY
      "idCoin"
  ) "quotesGetBaseHelper"
LEFT JOIN
  values v
ON
  v."idCoin" = "quotesGetBaseHelper"."idCoin"
AND
  v.timestamp = "quotesGetBaseHelper".maxTimestamp
LEFT JOIN
  coins c
ON
  c."id" = v."idCoin"
`;
