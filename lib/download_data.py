# -*- coding: utf-8 -*-
import csv
import json
import StringIO

from tarbell.oauth import get_drive_api

SPREADSHEETS = {
    # Cases
    #'cases': '1DyJz3uWjZXBFZIVpV1y0FxBElfA29U4NR41nX_5XT9w', #original
    'cases': '1YnDgLxycT-jwjuxwBuuJjlFCXPk4u5P_3yA57gPWHgo', #2017
    # Victims
    #'victims': '1bRYEa8tzryjbs8HpvDqnu15oHoLLlBO93GsAaIOrFvA', #original
    'victims': '1_nUXS1jdWv_j5av368Reer3TBzQPBKnmvsBm2stKNsQ', #2017
    # Officers
    #'officers_full': '18TByyAf5TB4AiC8zNEkMWiOREHLAi6dDwzrLOGh5b14', #original
    'officers_full': '1Zs-3f0vrensScGo3lnnCf7xKrprric5M5HokgmENNHU', #2017
    # casecops -- completes the Officers dataset
    #'casecops': '1r3G3mmJ9fQV3fOJt3zKDnpf5-jzm78GJErSiLm1_H8A', #original
    'casecops': '1dlR4egtqSVQpw01d3VFwrEHDDvv2Bg7Y7hVWzoZRzi8',
    # Payments
    #'payments': '1IC5B7qoVkCMmzq6abrTkokq2Ua6nBQFmo4-0m-mPVgQ', #original
    'payments': '1gTcPfSEJ_qAZldr23BdW97NWRDa-kRSY1VZ3zf6JOGY' #2017
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
