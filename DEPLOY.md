# Pulling new data and deploying/publishing the project

## Prerequisites

1. AWS credentials for deploying to INN and Chicago Reporter S3 accounts
2. Google client secrets configured to pull data from Google Sheets
3. Boundary service set up locally to identify Chicago neighborhood for each case

The first two steps can be completed using the `tarbell configure` command from your shell. [See the documentation](http://tarbell.readthedocs.io/en/1.0.4/install.html#configure-tarbell-with-tarbell-configure).

## AWS credentials setup

When configuring tarbell with `tarbell configure`, you'll be asked to input your S3 Access Key ID and your S3 Secret Access Key. These should be the credentials for your INN AWS user account.

You should have a credentials.csv with this information. If you do not, ask the person responsible for managing INN AWS user accounts to create an account and issue you your credentials.

After configuring your AWS credentials, you'll get this message:

    Would you like to add bucket credentials? [y/N]

Choose "y" and add the Reporter's Access Key ID and Secret Access Key for the bucket "projects.chicagoreporter.com." You can find this info stored in 1Pass under "Chicago Reporter AWS Credentials."

## Google client secrets setup

The Google account you use to complete the [Configure Google spreadsheet access](http://tarbell.readthedocs.io/en/1.0.4/install.html#configure-google-spreadsheet-access-optional) tutorial from the Tarbell docs should already have access to the necessary spreadsheets.

## Boundary service setup

To set up the required boundary service, follow the instruction in the README for the [INN boundaries repository](https://github.com/INN/boundaries).

## Pulling updated data from Google Sheets

To pull the latest data from Google Sheets, follow these steps:

1. Make sure you have the Boundary Service installed locally as per the notes above and have started the development server.
2. Run `./get_data.py` from the root of the `cpd_settlements` project.

The process will take some time to complete.

### What does this process do?

1. Imports and munges data into the appropriate formats for the app.
2. Attempts to get latitude and longitude data for each case address using the Google geocoder service. If it can't get this info for a case, it is skipped.
3. Uses the locally-installed boundary service to identify the Chicago Neighborhood where each lat, lng point falls. Whether or not a case has this data depends on the result of step 2.
4. Renders the front-end json files and the html includes used for the case search/filter form.

### What is NOT included in this process?

1. This process does **NOT** build static assets for the app. You **MUST** run `grunt build` and commit any changes showing by `git status` before deploying.
2. It does **NOT** deploy/publish the app to S3.

## Deploying the project/app

The following commands should be run from the root of the `cpd_settlements` project directory.

To deploy to staging:

    tarbell publish staging

To deploy to production:

    tarbell publish production
