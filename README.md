## Example wallet

This wallet has one purchase in 2011, one purchase in 3051, and one sale at the end of 3051. This is intended to show off and simulate capital gains features.

Note that the wallet processor doesn't care that these dates are in the future, and this just prevents this example from ever realistically being out of date.

* `basisUsd` means the cost basis of the transaction.
* `date` is an ISO representation of the UTC date (`YYYY-MM-DDTHH:mm:SS.milZ`), but any parseable date string should work.
* `quantity` is the number of units purchased.

So for the first entry, 10 Bitcoins were purchased on the 31st of December in the year 2011 for a total of $10, that's $1 per Bitcoin.

    {
      "BTC": [
        {
          "basisUsd": 10,
          "date": "2011-12-31T00:00:00.000Z",
          "quantity": 10
        },
        {
          "basisUsd": 100000,
          "date": "3051-12-30T00:00:00.000Z",
          "quantity": 0.1
        },
        {
          "basisUsd": -1000000,
          "date": "3051-12-31T00:00:00.000Z",
          "quantity": -1
        }
      ]
    }

![Rendered Wallet](https://raw.githubusercontent.com/0time/crypto-wallet-tracker/master/docs/images/wallet.png)
