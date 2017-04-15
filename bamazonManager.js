var mysql = require("mysql");
var inquirer = require("inquirer");
var quantity;

//var unitsLeft;
//var product_Id;

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "sb012073",
    database: "BamazonDB"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    menuOptions();
});

var newProduct = function(productName, deptName, unitPrice, unitsInStock) {
        this.productName = productName;
        this.deptName = deptName;
        this.unitPrice = unitPrice;
        this.unitsInStock = unitsInStock;

    } // close newProduct()

var newInventory = function(productKey, units) {
        this.productKey = productKey;
        this.units = units;
    } // close newInventory


// Prompt "Manager" to choose a task to perform on the database
var menuOptions = function() {
    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add to Product"
        ]
    }).then(function(answers) {
        switch (answers.menu) {
            case "View Products for Sale":
                showProduct();
                break;

            case "View Low Inventory":
                viewLowInventory();
                break;

            case "Add to Inventory":
                updateInventory();
                break;

            case "Add to Product":
                addNewProduct();
                break;

        }
    });
};



// Display all products in Products table
var showProduct = function() {
        console.log("Inside showproduct function");
        connection.query("SELECT * FROM products", function(err, res) {
            if (err) throw err;
            //console.log(res);
            console.log("B A M A Z O N   I T E M S   A V A I L A B L E");
            for (var i = 0; i < res.length; i++) {
                console.log("ProductID: " + res[i].productID + " || ProductName: " + res[i].productName + " || DeptName: " + res[i].deptName + " || UnitPrice: " + res[i].unitPrice + "|| UnitsInStock: " + res[i].unitsInStock);
            }
            continueWorking();
        });
    } // close showProduct

// View products that has less than 5 units in stock
var viewLowInventory = function() {
        connection.query("SELECT * FROM Products HAVING unitsInstock < 5", function(err, res, fields) {
            if (err)
                throw err;
            console.log(" L O W   I N V E N T O R Y");
            for (var i = 0; i < res.length; i++) {
                console.log("ProductID: " + res[i].productID + " || ProductName: " + res[i].productName + " || DeptName: " + res[i].deptName + " || UnitPrice: " + res[i].unitPrice + "|| UnitsInStock: " + res[i].unitsInStock);
            }
            continueWorking();
        })
    } // close viewLowInventory

// Update the inventory to input from "Manager"
var updateInventory = function() {
        inquirer.prompt([{
            name: "productKey",
            type: "input",
            message: "Please enter the ProductID of the item's inventory you would like to update."
        }, {
            type: "input",
            message: "How many units?",
            name: "units"
        }]).then(function(answers) {
            connection.query("UPDATE Products SET ? WHERE ?", [{
                unitsInStock: answers.units
            }, {
                productID: answers.productKey
            }], function(err, res) {
                if (err) throw err;
                if (res.length === 0) {
                    console.log("OOPS...something went wrong. :-( ");
                    continueShopping();
                } else {
                    //console.log(fields);

                    var newInv = new newInventory(answers.productKey, answers.units);
                    console.log(newInv);
                    console.log(res);
                    //console.log("ProductID: " + res[0].productID + " || ProductName: " + res[0].productName + " || DeptName: " + res[0].deptName + " || UnitPrice: " + res[0].unitPrice + "|| UnitsInStock: " + res[0].unitsInStock);
                }
                continueWorking();
            });

        })
    } // close updateInventory()

// add new products to the Products table
var addNewProduct = function() {
        inquirer.prompt([{
                name: "product_Name",
                type: "input",
                message: "Please enter the name of your product:"
            }, {
                name: "dept_Name",
                type: "input",
                message: "Enter department name:"
            }, {
                name: "unit_price",
                type: "input",
                message: "Enter price for product:"
            }, {
                name: "units_InStock",
                type: "input",
                message: "Enter units in stock:"
            }

        ]).then(function(answers) {
            connection.query("INSERT INTO products SET ?", {
                productName: answers.product_Name,
                deptName: answers.dept_Name,
                unitPrice: answers.unit_price,
                unitsInStock: answers.units_InStock
            }, function(err, res) {
                var newProd = new newProduct(answers.product_Name, answers.dept_name, answers.unit_price, answers.units_InStock);
                console.log(newProd);
                continueWorking();
            });

        })


    } // close addNewProduct

// ask the Manager if they would like to continue the program or terminate
var continueWorking = function() {
        inquirer.prompt([{
            name: "shop",
            type: "list",
            choices: ["Y", "N"],
            message: "Continue?"
        }]).then(function(answers) {
            if (answers.shop === 'Y') {
                //continueShopping = true;
                menuOptions();
            } else {
                //continueShopping = false;
                connection.end();
            }
        })
    } // close continueWorking()
