"use strict";


const crypto = require("crypto");


const stockLikes = {};


function validateQueryForAppropiateFields(query) {
  return Object.keys(query).every((field) => ["stock", "like"].includes(field)) && Object.keys(query).includes("stock") && Object.keys(query).includes("like");
}

function validateQueryStockField(query) {
  return (
    typeof query.stock === "string" ||
    (Array.isArray(query.stock) && query.stock.length === 2 && query.stock.every((symbol) => typeof symbol === "string"))
  );
}

function validateQueryLikeField(query) {
  return !Object.keys(query).includes("like") || (typeof query.like === "string" && ["true", "false"].includes(query.like));
}

function validateQuery(query) {
  return validateQueryForAppropiateFields(query) && validateQueryStockField(query) && validateQueryLikeField(query);
}

async function getStockInformationForSymbol(symbol) {
  const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`);
  return await response.json();
}

function determineQueryType(query) {
  if (typeof query.stock === "string") {
    return "oneStock";
  } else if (Array.isArray(query.stock)) {
    return "twoStocks";
  } else {
    return "error"
  }
}


module.exports = function (app) {
  app.get(
    "/api/stock-prices",
    async (request, response) => {
      const queryIsValid = validateQuery(request.query);
      if (queryIsValid) {
        const queryType = determineQueryType(request.query);
        if (queryType === "oneStock") {
          const stockInformation = await getStockInformationForSymbol(request.query.stock);
          if (["Invalid symbol", "Unknown symbol"].includes(stockInformation)) {
            response.json({
              "stockData": {
                "error": "invalid symbol"
              }
            });
          } else {
            if (!Object.hasOwn(stockLikes, stockInformation.symbol)) {
              stockLikes[stockInformation.symbol] = [];
            }
            if (request.query.like === "true") {
              const ipHash = crypto.createHash("sha256").update(request.ip).digest("hex");
              if (!stockLikes[stockInformation.symbol].includes(ipHash)) {
                stockLikes[stockInformation.symbol].push(ipHash);
              }
            }
            response.json({
              stockData: {
                stock: stockInformation.symbol,
                price: stockInformation.latestPrice,
                likes: stockLikes[stockInformation.symbol].length
              }
            });
          }
        } else if (queryType === "twoStocks") {
          const stockInformation1 = await getStockInformationForSymbol(request.query.stock[0]);
          if (["Invalid symbol", "Unknown symbol"].includes(stockInformation1)) {
            response.json({
              "stockData": {
                "error": "invalid symbol"
              }
            });
          } else {
            const stockInformation2 = await getStockInformationForSymbol(request.query.stock[1]);
            if (["Invalid symbol", "Unknown symbol"].includes(stockInformation2)) {
              response.json({
                "stockData": {
                  "error": "invalid symbol"
                }
              });
            } else {
              if (!Object.hasOwn(stockLikes, stockInformation1.symbol)) {
                stockLikes[stockInformation1.symbol] = [];
              }
              if (!Object.hasOwn(stockLikes, stockInformation2.symbol)) {
                stockLikes[stockInformation2.symbol] = [];
              }
              if (request.query.like === "true") {
                const ipHash = crypto.createHash("sha256").update(request.ip).digest("hex");
                if (!stockLikes[stockInformation1.symbol].includes(ipHash)) {
                  stockLikes[stockInformation1.symbol].push(ipHash);
                }
                if (stockInformation1.symbol !== stockInformation2.symbol && !stockLikes[stockInformation2.symbol].includes(ipHash)) {
                  stockLikes[stockInformation2.symbol].push(ipHash);
                }
              }
              response.json({
                stockData: [
                  {
                    stock: stockInformation1.symbol,
                    price: stockInformation1.latestPrice,
                    rel_likes: stockLikes[stockInformation1.symbol].length - stockLikes[stockInformation2.symbol].length
                  },
                  {
                    stock: stockInformation2.symbol,
                    price: stockInformation2.latestPrice,
                    rel_likes: stockLikes[stockInformation2.symbol].length - stockLikes[stockInformation1.symbol].length
                  },
                ]
              });
            }
          }
        } else {
          response.json({
            "stockData": {
              "error": "invalid request"
            }
          });
        }
      } else {
        response.json({
          "stockData": {
            "error": "invalid request"
          }
        });
      }
    }
  );
};