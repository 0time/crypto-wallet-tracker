CREATE TABLE "coins" (
  "id"                    SERIAL PRIMARY KEY,
  "circulatingSupply"     NUMERIC(40, 10),
  "lastUpdated"           VARCHAR(255),
  "marketCap"             NUMERIC(40, 10),
  "maxSupply"             NUMERIC(40, 10),
  "name"                  VARCHAR(255),
  "percentChange1h"       NUMERIC(40, 10),
  "percentChange24h"      NUMERIC(40, 10),
  "percentChange7d"       NUMERIC(40, 10),
  "slug"                  VARCHAR(255),
  "symbol"                VARCHAR(255),
  "volume24h"             NUMERIC(40, 10)
);

CREATE TABLE "values" (
  "id"                    BIGSERIAL PRIMARY KEY,
  "idCoin"                INT,
  "price"                 NUMERIC(40, 10),
  "timestamp"             VARCHAR(255)
);

CREATE INDEX values_idCoin ON "values" USING btree ("idCoin");
CREATE INDEX values_timestamp ON "values" USING btree ("timestamp");
CREATE UNIQUE INDEX coins_symbol on "coins" ("symbol");
CREATE UNIQUE INDEX values_idCoin_timestamp on values ("idCoin", "timestamp");
