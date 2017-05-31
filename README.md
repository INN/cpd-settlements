# CPD Misconduct Lawsuits

## Preamble

NOTE: this README assumes the default Tarbell project directory: `~/.tarbell/`.

NOTE: you should create a virtualenv for the project before installing Tarbell:

    mkvirtualenv cpd

Make sure you're using this virtualenv for all steps described in README.md and DEPLOY.md files.

## Getting started

This project requires Tarbell. Follow Tarbell's [installation instructions](http://tarbell.readthedocs.io/en/1.0.4/install.html) to ensure you have the required software.

Refer to the steps outlined in DEPLOY.md for information to help with the initial installation and configuration of Tarbell. The steps in DEPLOY.md are required to import the data for the project and for deploying/publishing the project to S3.

## Installing the CPD project

After you've installed Tarbell, you can install the CPD project with the following command:
    
    tarbell install https://github.com/INN/cpd-settlements

Tarbell will prompt you: "Where would you like to create this project? [/Users/yourusernamegoeshere/tarbell/cpd-settlements]"

The project directory must use underscores, not hyphens. So, be sure and change the location for the project to something like: `/Users/yourusernamegoeshere/tarbell/cpd_settlements`. Make sure you change the value `yourusernamegoeshere` to your *actual* user name.

Tarbell will also ask if you want to install requirements with `pip install -r requirements`. Answer "y" to this prompt.

At this point, you'll need to pull the project data from Google Sheets. If you haven't already done so, refer to DEPLOY.md for information on the data import process.

## Running the project locally

NOTE: You **MUST** complete the data import process before trying to run the project locally. Refer to DEPLOY.md if you haven't already done so.

This project uses npm (grunt) and bower for its pre-deployment build process and javascript dependencies. Make sure the required software is installed by running the following commands from the root of the `cpd_settlements` project directory:

    npm install
    bower install

Once you've installed the npm and bower requirements, install grunt if necessary:

    npm install -g grunt-cli
    
Then run the build process:

    grunt build

After the build process completes, use tarbell to "switch" to the CPD project:

    tarbell switch cpd_settlements

This will start a local development server where you can view and work on the app: http://localhost:5000/

## Working with LESS and JS files

If you are making changes to the LESS files, be sure and run `grunt watch` so that any changes made in the LESS files are reflected in the compiled CSS used by the app.

After you've made changes to the LESS files and are ready to commit, run the `grunt build` command to ensure all of the appropriate CSS files have been compiled and minified.

Likewise, if you make any changes to the `*.js` files in the `assets/js` directory, you must run `grunt build` to ensure the appropriate `*.min.js` files have been concatenated and uglified.
