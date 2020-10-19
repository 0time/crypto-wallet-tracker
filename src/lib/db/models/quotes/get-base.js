module.exports = `
SELECT
  c.symbol                            AS symbol,
  c.name                              AS name,
  v.price                             AS price,
  "quotesGetBaseHelper".maxTimestamp  AS timestamp,
  c."maxSupply"                       AS "maxSupply",
  c."circulatingSupply"               AS "circulatingSupply",
  c."percentChange1h"                 AS "percentChange1h",
  c."percentChange24h"                AS "percentChange24h",
  c."percentChange7d"                 AS "percentChange7d",
  c.slug                              AS slug,
  c."marketCap"                       AS "marketCap",
  c."volume24h"                       AS "volume24h"
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
