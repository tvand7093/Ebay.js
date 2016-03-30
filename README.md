### eBay.js
An eBay-like system for intro to databases.

### System Requirements
1. Any Linux distro (Ubuntu 14.04 prefered).
2. Node.js v5.7.0 or greater
3. MySQL v5.7.11 or greater

### Running the application
1. Clone the repository
2. Make sure you have Node.js installed on your machine. If not installed, follow the guide [here](https://nodejs.org/en/download/package-manager/).
3. Install all missing packages by running: `npm install .`
4. Make sure you have mysql installed and configured on your machine. See this [how-to](https://www.linode.com/docs/databases/mysql/install-mysql-on-ubuntu-14-04) for installing and configuring mysql on Ubuntu.
5. Run the the server by calling `node .`.

### Running the tests
First off, make sure you have Jasmine installed before you continue on by running the following command: `npm install -g jasmine`.
Then, to run the currently built tests, just run the following command: `npm test`.