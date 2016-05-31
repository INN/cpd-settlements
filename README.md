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

    tarbell install git@bitbucket.org:projectlargo/cpd-settlements.git

Tarbell will prompt you: "Where would you like to create this project? [/Users/yourusernamegoeshere/tarbell/cpd-settlements]"

The project directory must use underscores, not hyphens. So, be sure and change the location for the project to something like: `/Users/yourusernamegoeshere/tarbell/cpd_settlements`. Make sure you change the value `yourusernamegoeshere` to your *actual* user name.

Tarbell will also ask if you want to install requirements with `pip install -r requirements`. Answer "y" to this prompt.

At this point, you'll need to pull the project data from Google Sheets. If you haven't already done so, refer to DEPLOY.md for information on the data import process.
