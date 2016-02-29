# -*- coding: utf-8 -*-
import csv
import json
import StringIO

from tarbell.oauth import get_drive_api

SPREADSHEETS = {
    # Cases
    'cases': '1hywf7_YjhDWFVuZUj-e5bEb2mY1MhQbeP1AfHFUMI1Q',
    # Victims
    'victims': '1G5CnJw6ywg1BRY9VzM6H0iakDzfoU5e4-jKxcrMUW84',
    # Officers
    'officers': '1_fgC_h3EslCxK2xqw8mr1yU11_E4gjXVa0ZvYniLEEM',
    # Payments
    'payments': '1IC5B7qoVkCMmzq6abrTkokq2Ua6nBQFmo4-0m-mPVgQ',
}


def main():
    download_data()


def download_data():
    api = get_drive_api()

    for filename, key in SPREADSHEETS.items():
        print "Retrieving %s data..." % filename
        # Retrieve the spreadsheet from Drive
        spreadsheet = api.files().get(fileId=key).execute()

        # Get the CSV download link
        links = spreadsheet.get('exportLinks')
        csv_link = links.get('text/csv')

        # Download the CSV
        resp, content = api._http.request(csv_link)

        # Convert the CSV content to a serializable Python data structure
        data = StringIO.StringIO(content)
        reader = csv.DictReader(data)
        rows = [row for row in reader]

        # Write csv file
        with open('data/%s.csv' % filename, 'wb') as csvf:
            print "Exporting to CSV: data/%s.csv" % filename
            csvf.write(content)

        # Write the JSON data to file
        with open('data/%s.json' % filename, 'wb') as jsonf:
            print "Exporting to JSON: data/%s.json" % filename
            jsonf.write(json.dumps(rows))

    print 'Done.'


if __name__ == '__main__':
    main()
