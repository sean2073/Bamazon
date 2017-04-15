var mysql = require("mysql");
var inquirer = require("inquirer");
var cost;
var unitPrice;
var unitsLeft;
var product_Id;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "sb012073",
    database: "BamazonDB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    showProduct();
});

var Customer = function (productKey, units) {
    this.productKey = productKey;
    this.units = units;
    this.price = function () {
        cost = this.units * unitPrice;
        console.log("Total Price = $" + cost);
    }

} // close Customer()
// Display all products in Products table
var showProduct = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        //console.log(res);
        console.log("B A M A Z O N   P R O D U C T S   F O R   S A L E");
        for (var i = 0; i < res.length; i++) {
            console.log("ProductID: " + res[i].productID + " || ProductName: " + res[i].productName + " || DeptName: " + res[i].deptName + " || UnitPrice: " + res[i].unitPrice + "|| UnitsInStock: " + res[i].unitsInStock);
        }

        buyProduct();
    });
} // close showProduct
// Ask user what product they would like to buy.
// Make sure there is enough unitsInStock
var buyProduct = function () {
    inquirer.prompt([{
        name: "productKey",
        type: "input",
        message: "Please enter the ProductID of the product you would like to buy."
        }, {
        type: "input",
        message: "How many units would you like to buy?",
        name: "units"
        }]).then(function (answers) {
        connection.query("SELECT * FROM Products WHERE productID = ? HAVING unitsInstock >= ?", [
                answers.productKey, answers.units
            ], function (err, res, fields) {
            if (err)
                throw err;
            console.log(res.length);
            if (res.length === 0) {
                console.log("Sorry...This item is out of stock. :-( ");
                continueShopping();
            } else {
                //console.log(fields);
                unitPrice = res[0].unitPrice;
                unitsLeft = res[0].unitsInStock - answers.units;
                product_Id = answers.productKey;
                updateProducts();
                var newCust = new Customer(answers.productKey, answers.units);
                console.log(newCust);
                newCust.price();
                continueShopping();
            }
        })
    })
} // close buyProduct()
// Update Products table with its new unitsInStock
var updateProducts = function () {
    connection.query("UPDATE Products SET ? WHERE ?", [{
        unitsInStock: unitsLeft
        }, {
        productID: product_Id
        }], function (err, res) {
        if (err) throw err;
    });

} // close updateProducts()

var continueShopping = function () {
    inquirer.prompt([{
        name: "shop",
        type: "list",
        choices: ["Y", "N"],
        message: "Continue Shopping?"
        }]).then(function (answers) {
        if (answers.shop === 'Y') {
            //continueShopping = true;
            showProduct();
        } else {
            //continueShopping = false;
            connection.end();
        }
    })
} // close continueShopping()
