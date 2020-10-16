module.exports = `
SELECT
  c.symbol AS symbol
FROM
  (
    SELECT
      "idCoin",
      MAX(timestamp) AS "maxTimestamp"
    FROM
      values
    GROUP BY
      "idCoin"
  ) "mostStaleHelper"
LEFT JOIN
  values v
ON
  v."idCoin" = "mostStaleHelper"."idCoin"
AND
  v.timestamp = "mostStaleHelper"."maxTimestamp"
RIGHT JOIN
  coins c
ON
  c.id = v."idCoin"
ORDER BY
  COALESCE("mostStaleHelper"."maxTimestamp", '1970-01-01T00:00:00.000Z') ASC
LIMIT
  $1
`;
