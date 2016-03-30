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
5. Run the development SQL seed method. This is done by following the commands below.
  - Change directories into the "sql" folder containing all the scripts.
  - Login to the MySQL CLI using: `mysql -u developer -p`
  - Enter in the development password.
  - Once logged into the CLI, run the sql file by running: `source dev-seed.sql`.
  - At this point, all pre-existing database tables will be dropped and new ones will be created with dummy data.
  - Now exit the CLI with: `exit`. 
6. Run the the server by calling `node .`.

### Debugging
Node ships with its own debugger. The debugger it uses is similar to that of GDB. In order to use it, simply run `node debug .` rather than the `node .`. This will allow you to
break, continue, pause, stop, etc anywhere in the code. Specifically, use the `debugger` keyword anywhere you want to create a breakpoint. For a more detailed listing
of commands and examples, see the [Node Debugging Documentation](https://nodejs.org/api/debugger.html#debugger_info).

### Running the tests
First off, make sure you have Jasmine installed before you continue on by running the following command: `npm install -g jasmine`.
Then, to run the currently built tests, just run the following command: `npm test`.